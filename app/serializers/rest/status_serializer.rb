# frozen_string_literal: true

class REST::StatusSerializer < ActiveModel::Serializer
  include FormattingHelper

  # Please update `app/javascript/mastodon/api_types/statuses.ts` when making changes to the attributes

  attributes :id, :created_at, :in_reply_to_id, :in_reply_to_account_id,
             :sensitive, :spoiler_text, :visibility, :language,
             :uri, :url, :replies_count, :reblogs_count,
             :favourites_count, :quotes_count, :edited_at,
             :bounty_amount, :truth_count, :safe_count, :fake_count, :is_incident,
             :real_estate_price, :real_estate_area, :real_estate_legal_status, :real_estate_zoning,
             :truth_score, :is_suspicious, :human_zone, :ai_detected, :ai_confidence

  # Reality Engine / Truth Verification Protocol
  def truth_score
    SafetyHeuristicsService.calculate_truth_score(object)
  end

  def is_suspicious
    SafetyHeuristicsService.evaluate_suspicion!(object)
    object.is_suspicious
  end

  attribute :favourited, if: :current_user?
  attribute :reblogged, if: :current_user?
  attribute :muted, if: :current_user?
  attribute :bookmarked, if: :current_user?
  attribute :pinned, if: :pinnable?
  has_many :filtered, serializer: REST::FilterResultSerializer, if: :current_user?

  attribute :content, unless: :source_requested?
  attribute :text, if: :source_requested?

  belongs_to :reblog, serializer: REST::StatusSerializer
  belongs_to :application, if: :show_application?
  belongs_to :account, serializer: REST::AccountSerializer

  has_many :ordered_media_attachments, key: :media_attachments, serializer: REST::MediaAttachmentSerializer
  has_many :ordered_mentions, key: :mentions
  has_many :tags
  has_many :emojis, serializer: REST::CustomEmojiSerializer

  # Due to a ActiveModel::Serializer quirk, if you change any of the following, have a look at
  # updating `app/serializers/rest/shallow_status_serializer.rb` as well
  has_one :quote, key: :quote, serializer: REST::QuoteSerializer
  has_one :preview_card, key: :card, serializer: REST::PreviewCardSerializer
  has_one :preloadable_poll, key: :poll, serializer: REST::PollSerializer
  has_one :quote_approval

  def quote
    object.quote if object.quote&.acceptable?
  end

  def bounty_amount
    object.bounty_amount || 0
  end

  def truth_count
    object.truth_notes.where(truth_score: 1).count
  end

  def safe_count
    object.truth_notes.where(safe_score: 1).count
  end

  def fake_count
    object.truth_notes.where(fake_score: 1).count
  end

  def id
    object.id.to_s
  end

  def in_reply_to_id
    object.in_reply_to_id&.to_s
  end

  def in_reply_to_account_id
    object.in_reply_to_account_id&.to_s
  end

  def current_user?
    !current_user.nil?
  end

  def show_application?
    object.account.user_shows_application? || (current_user? && current_user.account_id == object.account_id)
  end

  def visibility
    # This visibility is masked behind "private"
    # to avoid API changes because there are no
    # UX differences
    if object.limited_visibility?
      'private'
    else
      object.visibility
    end
  end

  def sensitive
    if current_user? && current_user.account_id == object.account_id
      object.sensitive
    else
      object.account.sensitized? || object.sensitive
    end
  end

  def uri
    ActivityPub::TagManager.instance.uri_for(object)
  end

  def content
    status_content_format(object)
  end

  def url
    ActivityPub::TagManager.instance.url_for(object)
  end

  def reblogs_count
    object.untrusted_reblogs_count || relationships&.attributes_map&.dig(object.id, :reblogs_count) || object.reblogs_count
  end

  def favourites_count
    object.untrusted_favourites_count || relationships&.attributes_map&.dig(object.id, :favourites_count) || object.favourites_count
  end

  def quotes_count
    relationships&.attributes_map&.dig(object.id, :quotes_count) || object.quotes_count
  end

  def favourited
    if relationships
      relationships.favourites_map[object.id] || false
    else
      current_user.account.favourited?(object)
    end
  end

  def reblogged
    if relationships
      relationships.reblogs_map[object.id] || false
    else
      current_user.account.reblogged?(object)
    end
  end

  def muted
    if relationships
      relationships.mutes_map[object.conversation_id] || false
    else
      current_user.account.muting_conversation?(object.conversation)
    end
  end

  def bookmarked
    if relationships
      relationships.bookmarks_map[object.id] || false
    else
      current_user.account.bookmarked?(object)
    end
  end

  def pinned
    if relationships
      relationships.pins_map[object.id] || false
    else
      current_user.account.pinned?(object)
    end
  end

  def filtered
    if relationships
      relationships.filters_map[object.id] || []
    else
      current_user.account.status_matches_filters(object)
    end
  end

  def pinnable?
    current_user? &&
      current_user.account_id == object.account_id &&
      !object.reblog? &&
      StatusRelationshipsPresenter::PINNABLE_VISIBILITIES.include?(object.visibility)
  end

  def source_requested?
    instance_options[:source_requested]
  end

  def ordered_mentions
    object.active_mentions.to_a.sort_by(&:id)
  end

  def quote_approval
    {
      automatic: object.proper.quote_policy_as_keys(:automatic),
      manual: object.proper.quote_policy_as_keys(:manual),
      current_user: object.proper.quote_policy_for_account(current_user&.account),
    }
  end

  private

  def relationships
    instance_options && instance_options[:relationships]
  end

  class ApplicationSerializer < ActiveModel::Serializer
    attributes :name, :website

    def website
      object.website.presence
    end
  end

  class MentionSerializer < ActiveModel::Serializer
    attributes :id, :username, :url, :acct

    def id
      object.account_id.to_s
    end

    def username
      object.account_username
    end

    def url
      ActivityPub::TagManager.instance.url_for(object.account)
    end

    def acct
      object.account.pretty_acct
    end
  end

  class TagSerializer < ActiveModel::Serializer
    include RoutingHelper

    attributes :name, :url

    def url
      tag_url(object)
    end
  end
end

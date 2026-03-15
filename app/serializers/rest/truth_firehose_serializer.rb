# frozen_string_literal: true

class REST::TruthFirehoseSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :id, :claim, :claim_type, :transmission_path_length,
             :truth_score, :witnesses, :location, :evidence_links,
             :timestamp, :provenance_signature

  # Strip all HTML so the LLM doesn't hallucinate or get confused by tags
  def claim
    ActionController::Base.helpers.strip_tags(object.text).strip
  end

  def claim_type
    object.claim_type
  end

  def transmission_path_length
    object.transmission_path_length
  end

  def truth_score
    object.truth_score || 0.0
  end

  def witnesses
    # Provide the count and profile URL of the primary witness (author)
    {
      author: object.account.acct,
      author_trust_score: object.account.trust_score,
      total_safe_votes: object.safe_count,
      total_fake_votes: object.fake_count
    }
  end

  def location
    return nil unless object.latitude.present? && object.longitude.present?

    {
      latitude: object.latitude,
      longitude: object.longitude
    }
  end

  def evidence_links
    # Pass media URLs directly as evidence for the AI to analyze via Vision/OCR
    object.media_attachments.map do |media|
      {
        type: media.type,
        url: full_asset_url(media.file.url(:original))
      }
    end
  end

  def timestamp
    object.created_at.iso8601
  end

  def provenance_signature
    object.claim_signature
  end
end

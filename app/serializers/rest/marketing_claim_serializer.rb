# frozen_string_literal: true

class REST::MarketingClaimSerializer < ActiveModel::Serializer
  attributes :id, :product_name, :marketing_text, :media_url, :target_url,
             :status, :budget, :crab_score, :is_crab_verified, :created_at

  has_one :account, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end
end

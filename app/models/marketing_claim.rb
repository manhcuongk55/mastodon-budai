# frozen_string_literal: true

# == Schema Information
#
# Table name: marketing_claims
#
#  id               :bigint(8)        not null, primary key
#  budget           :integer          default(0)
#  crab_score       :decimal(, )      default(0.0)
#  is_crab_verified :boolean          default(FALSE)
#  marketing_text   :text
#  media_url        :string
#  product_name     :string
#  status           :string           default("pending_review")
#  target_url       :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  account_id       :bigint(8)        not null
#
class MarketingClaim < ApplicationRecord
  belongs_to :account
end

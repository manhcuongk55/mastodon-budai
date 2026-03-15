# frozen_string_literal: true

# == Schema Information
#
# Table name: ad_campaigns
#
#  id               :bigint(8)        not null, primary key
#  budget           :integer
#  crab_score       :decimal(, )
#  description      :text
#  is_crab_verified :boolean
#  media_url        :string
#  status           :string
#  target_url       :string
#  title            :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  account_id       :bigint(8)        not null
#
class AdCampaign < ApplicationRecord
  belongs_to :account
end

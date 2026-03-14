# frozen_string_literal: true

# == Schema Information
#
# Table name: vouches
#
#  id                :bigint(8)        not null, primary key
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  account_id        :bigint(8)        not null
#  target_account_id :bigint(8)        not null
#
class Vouch < ApplicationRecord
  belongs_to :account
  belongs_to :target_account, class_name: 'Account'

  validates :target_account_id, uniqueness: { scope: :account_id, message: 'has already been vouched by this user' }
end

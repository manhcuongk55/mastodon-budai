# frozen_string_literal: true

# == Schema Information
#
# Table name: guild_memberships
#
#  id         :bigint(8)        not null, primary key
#  role       :string           default("member"), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  account_id :bigint(8)        not null
#  guild_id   :bigint(8)        not null
#
class GuildMembership < ApplicationRecord
  belongs_to :guild
  belongs_to :account

  validates :account_id, uniqueness: { scope: :guild_id, message: 'already a member of this guild' }

  ROLES = %w[member leader].freeze
  validates :role, inclusion: { in: ROLES }
end

# frozen_string_literal: true

# Epic AE: AI Agent Registry
# Allows AI accounts to register transparently so the community
# can distinguish between disclosed bots and hidden/deceptive ones.
#
# Agent Types:
#   - assistant    (helpful bots, translators, moderators)
#   - marketing    (advertising, promotion bots)
#   - analytics    (data aggregation, reporting)
#   - creative     (art, music, writing generation)
#   - autonomous   (fully autonomous agents)
#   - other

# == Schema Information
#
# Table name: ai_agent_registrations
#
#  id            :bigint(8)        not null, primary key
#  agent_name    :string
#  agent_type    :string
#  capabilities  :text
#  operator_name :string
#  operator_url  :string
#  purpose       :text
#  status        :string
#  verified      :boolean
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  account_id    :bigint(8)        not null
#
class AiAgentRegistration < ApplicationRecord
  belongs_to :account

  AGENT_TYPES = %w[assistant marketing analytics creative autonomous other].freeze
  STATUSES    = %w[pending approved rejected suspended].freeze

  validates :agent_name, presence: true, length: { maximum: 100 }
  validates :agent_type, presence: true, inclusion: { in: AGENT_TYPES }
  validates :operator_name, presence: true, length: { maximum: 200 }
  validates :purpose, presence: true, length: { maximum: 1000 }
  validates :status, inclusion: { in: STATUSES }

  scope :approved, -> { where(status: 'approved') }
  scope :pending, -> { where(status: 'pending') }
  scope :by_type, ->(type) { where(agent_type: type) }

  after_save :update_account_bot_flag

  private

  def update_account_bot_flag
    account.update_column(:bot, true) if status == 'approved'
  end
end

# frozen_string_literal: true

# Epic AF: Community Data Verification
# A VerificationTask represents a claim that needs community verification.
# Users can pick up tasks, submit evidence, and earn Truth Berries.
#
# Lifecycle: open → in_progress → consensus_reached → verified / rejected

# == Schema Information
#
# Table name: verification_tasks
#
#  id                  :bigint(8)        not null, primary key
#  claim_text          :text
#  claim_type          :string
#  current_verifiers   :integer
#  expires_at          :datetime
#  required_verifiers  :integer
#  reward_berries      :integer
#  verification_status :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  status_id           :bigint(8)        not null
#
class VerificationTask < ApplicationRecord
  belongs_to :status
  has_many :verification_evidences, dependent: :destroy

  CLAIM_TYPES = %w[marketing product location identity content real_estate].freeze
  VERIFICATION_STATUSES = %w[open in_progress consensus_reached verified rejected expired].freeze

  validates :claim_type, inclusion: { in: CLAIM_TYPES }
  validates :claim_text, presence: true, length: { maximum: 1000 }
  validates :verification_status, inclusion: { in: VERIFICATION_STATUSES }
  validates :required_verifiers, numericality: { greater_than: 0 }

  scope :open_tasks, -> { where(verification_status: 'open').where('expires_at > ?', Time.current) }
  scope :by_type, ->(type) { where(claim_type: type) }
  scope :needing_verifiers, -> { where('current_verifiers < required_verifiers') }

  after_initialize :set_defaults, if: :new_record?

  def progress_percentage
    return 0 if required_verifiers.zero?
    [(current_verifiers.to_f / required_verifiers * 100).round, 100].min
  end

  def check_consensus!
    return unless current_verifiers >= required_verifiers

    evidences = verification_evidences
    confirm_count = evidences.where(vote: 'confirm').count
    deny_count = evidences.where(vote: 'deny').count
    total = confirm_count + deny_count
    return if total.zero?

    ratio = confirm_count.to_f / total
    if ratio >= 0.7
      update!(verification_status: 'verified')
      distribute_rewards!
    elsif ratio <= 0.3
      update!(verification_status: 'rejected')
    else
      update!(verification_status: 'consensus_reached')
    end
  end

  private

  def set_defaults
    self.verification_status ||= 'open'
    self.required_verifiers ||= 5
    self.current_verifiers ||= 0
    self.reward_berries ||= 10
    self.expires_at ||= 7.days.from_now
  end

  def distribute_rewards!
    confirming_evidences = verification_evidences.where(vote: 'confirm')
    confirming_evidences.find_each do |evidence|
      evidence.account.increment!(:truth_berries, reward_berries)
    end
  end
end

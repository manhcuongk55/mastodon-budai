# frozen_string_literal: true

# Epic AF: Community Data Verification
# A VerificationEvidence is a user's submission to verify a claim.
# Users submit evidence (photo, text, location) and vote on authenticity.

# == Schema Information
#
# Table name: verification_evidences
#
#  id                   :bigint(8)        not null, primary key
#  confidence           :float
#  evidence_text        :text
#  evidence_type        :string
#  evidence_url         :string
#  vote                 :string
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  account_id           :bigint(8)        not null
#  verification_task_id :bigint(8)        not null
#
class VerificationEvidence < ApplicationRecord
  belongs_to :verification_task
  belongs_to :account

  EVIDENCE_TYPES = %w[photo text location document video review].freeze
  VOTES = %w[confirm deny unsure].freeze

  validates :evidence_type, inclusion: { in: EVIDENCE_TYPES }
  validates :vote, inclusion: { in: VOTES }
  validates :confidence, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1.0 }

  # Prevent duplicate submissions
  validates :account_id, uniqueness: { scope: :verification_task_id, message: 'đã gửi bằng chứng cho nhiệm vụ này' }

  after_create :update_task_counter

  private

  def update_task_counter
    task = verification_task
    task.increment!(:current_verifiers)
    task.check_consensus!
  end
end

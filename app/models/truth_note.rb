# frozen_string_literal: true

# == Schema Information
#
# Table name: truth_notes
#
#  id            :bigint(8)        not null, primary key
#  content       :text
#  fake_score    :integer
#  is_public     :boolean
#  safe_score    :integer
#  truth_score   :integer
#  wave_strength :float
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  account_id    :bigint(8)        not null
#  status_id     :bigint(8)        not null
#
class TruthNote < ApplicationRecord
  belongs_to :status
  belongs_to :account

  validates :content, presence: true, length: { maximum: 500 }
  validates :truth_score, :safe_score, :fake_score, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  after_initialize :set_defaults, if: :new_record?

  # Basic Bridging Algorithm (Community Notes style)
  # Truth Wave Strength prioritizes diversity/consensus over raw volume.
  def calculate_wave_strength
    total_votes = truth_score + safe_score + fake_score
    return 0.0 if total_votes.zero?

    # Simulating "bridging" by penalizing polarized or heavily skewed low-vote scenarios
    # In a full implementation, this uses graph/matrix factorization on user histories.
    consensus_ratio = truth_score.to_f / total_votes
    
    # Needs a threshold of votes to be considered a strong wave
    if total_votes > 5 && consensus_ratio > 0.6
      self.wave_strength = (consensus_ratio * Math.log10(total_votes)).round(2)
      self.is_public = true if wave_strength > 1.5 # Arbitrary threshold to surface the note
    else
      self.wave_strength = 0.0
    end
  end

  private

  def set_defaults
    self.truth_score ||= 0
    self.safe_score ||= 0
    self.fake_score ||= 0
    self.wave_strength ||= 0.0
    self.is_public = false if is_public.nil?
  end
end

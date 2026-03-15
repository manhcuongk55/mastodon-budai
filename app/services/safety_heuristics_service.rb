# frozen_string_literal: true

class SafetyHeuristicsService
  # Epic O: Truth Verification Protocol (Reality Engine)
  # TruthScore(claim) = Σ (NodeTrust × EvidenceStrength × LocationWeight)
  
  def self.calculate_truth_score(status)
    return 0.0 unless status.is_a?(Status)

    # 1. NodeTrust: derived from Account's trust score (built in earlier Web of Trust epics) + 1 base
    node_trust = (status.account.try(:trust_score) || 0) + 1.0

    # 2. EvidenceStrength: Media + Community Votes
    media_weight = status.media_attachments.count * 5.0
    vote_weight = (status.safe_count.to_i * 2.0) - (status.fake_count.to_i * 3.0)
    
    # Base evidence is 1.0 if there are no flags/media
    evidence_strength = media_weight + vote_weight
    evidence_strength = 1.0 if evidence_strength <= 0 && vote_weight == 0

    # 3. LocationWeight
    # The reality engine backend assigns 1.5 if GPS location exists. 
    # The React frontend will dynamically modify this via Haversine distance.
    location_weight = status.latitude.present? && status.longitude.present? ? 1.5 : 1.0

    # 4. Epic Q: Human Trust Graph (Path Degradation)
    # Trust_new = Trust_source × TransmissionFactor^path_length
    transmission_factor = 0.6
    path_length = status.try(:transmission_path_length) || 0
    propagation_weight = (transmission_factor ** path_length)

    # 5. Information Classification Weight
    claim_type = status.try(:claim_type) || 'FACT'
    type_multiplier = case claim_type
                      when 'FACT' then 1.0
                      when 'ADVICE' then 0.5
                      when 'OPINION' then 0.3
                      when 'RUMOR' then 0.1
                      else 1.0
                      end

    raw_score = node_trust * evidence_strength * location_weight * propagation_weight * type_multiplier

    # Ensure score doesn't drop below 0
    final_score = [raw_score, 0.0].max.round(2)
    
    status.update_column(:truth_score, final_score) unless status.new_record?
    final_score
  end

  def self.evaluate_suspicion!(status)
    return false unless status.is_a?(Status)
    
    # Fake News Heuristic: High spread (reblogs), low verification.
    if status.reblogs_count.to_i > 10
      total_votes = status.safe_count.to_i + status.fake_count.to_i
      
      if total_votes > 0 
        ratio = status.safe_count.to_f / total_votes.to_f
        if ratio < 0.3
          status.update_column(:is_suspicious, true)
          return true
        end
      elsif status.reblogs_count.to_i > 50 && total_votes == 0
        # Viral with zero community verification is suspicious
        status.update_column(:is_suspicious, true)
        return true
      end
    end
    
    # If it recovered, unflag
    if status.is_suspicious
      status.update_column(:is_suspicious, false) 
    end
    false
  end
end

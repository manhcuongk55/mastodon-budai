# frozen_string_literal: true

# Epic AF-3: Auto-Verification Task Generator
# Automatically creates verification tasks for content that meets certain criteria:
# 1. High engagement (many reblogs) but low trust votes
# 2. Flagged as suspicious by SafetyHeuristicsService
# 3. AI-detected content with high confidence
# 4. Content with bounty attached (community wants verification)

class AutoVerificationService
  # Thresholds for auto-generating tasks
  HIGH_REBLOG_THRESHOLD = 5
  SUSPICIOUS_THRESHOLD  = true
  AI_CONFIDENCE_MIN     = 60
  BOUNTY_MIN            = 5

  def self.check_and_create(status)
    return unless status.is_a?(Status)
    return if status.verification_tasks.any? # Already has a verification task

    reasons = detect_reasons(status)
    return if reasons.empty?

    claim_text = build_claim_text(status, reasons)
    claim_type = determine_claim_type(status, reasons)

    VerificationTask.create!(
      status: status,
      claim_type: claim_type,
      claim_text: claim_text,
      required_verifiers: calculate_required_verifiers(reasons),
      reward_berries: calculate_reward(reasons),
      verification_status: 'open',
      expires_at: 7.days.from_now
    )

    Rails.logger.info "[AutoVerification] Created task for Status##{status.id}: #{reasons.join(', ')}"
  end

  # Batch scan: check recent statuses for auto-verification
  def self.scan_recent(limit: 50)
    statuses = Status.where('created_at > ?', 24.hours.ago)
                     .where.not(id: VerificationTask.select(:status_id))
                     .order(reblogs_count: :desc)
                     .limit(limit)

    created = 0
    statuses.each do |status|
      result = check_and_create(status)
      created += 1 if result
    end

    Rails.logger.info "[AutoVerification] Scanned #{statuses.size} statuses, created #{created} tasks"
    created
  end

  private

  def self.detect_reasons(status)
    reasons = []

    # 1. High engagement but low/no trust votes
    if status.reblogs_count.to_i >= HIGH_REBLOG_THRESHOLD
      total_votes = status.safe_count.to_i + status.fake_count.to_i + status.truth_count.to_i
      if total_votes < 3
        reasons << 'viral_no_verification'
      end
    end

    # 2. Flagged as suspicious
    if status.is_suspicious?
      reasons << 'suspicious_content'
    end

    # 3. AI-detected content
    if status.ai_detected? && status.ai_confidence.to_f >= AI_CONFIDENCE_MIN
      reasons << 'ai_generated'
    end

    # 4. Has bounty (community wants verification)
    if status.bounty_amount.to_i >= BOUNTY_MIN
      reasons << 'bounty_attached'
    end

    reasons
  end

  def self.build_claim_text(status, reasons)
    reason_descriptions = reasons.map do |r|
      case r
      when 'viral_no_verification'
        "📈 Bài viết viral (#{status.reblogs_count} boost) nhưng chưa được xác minh"
      when 'suspicious_content'
        "⚠️ Nội dung bị đánh dấu nghi vấn bởi hệ thống"
      when 'ai_generated'
        "🤖 Phát hiện nội dung có thể do AI tạo (#{status.ai_confidence.to_i}% confidence)"
      when 'bounty_attached'
        "🫐 Cộng đồng yêu cầu xác minh (#{status.bounty_amount} berries bounty)"
      end
    end

    text = status.text&.truncate(300) || 'Nội dung cần xác minh'
    "#{text}\n\n---\n#{reason_descriptions.join("\n")}"
  end

  def self.determine_claim_type(status, reasons)
    return 'marketing' if status.text&.match?(/mua|bán|giảm giá|sale|khuyến mãi/i)
    return 'real_estate' if status.real_estate_price.present?
    return 'content' if reasons.include?('ai_generated')
    'content'
  end

  def self.calculate_required_verifiers(reasons)
    base = 5
    base += 3 if reasons.include?('viral_no_verification')
    base += 2 if reasons.include?('ai_generated')
    base
  end

  def self.calculate_reward(reasons)
    base = 10
    base += 5 if reasons.include?('bounty_attached')
    base += 5 if reasons.include?('viral_no_verification')
    base
  end
end

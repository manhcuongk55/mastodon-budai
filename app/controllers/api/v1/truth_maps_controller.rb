# frozen_string_literal: true

class Api::V1::TruthMapsController < Api::BaseController
  before_action :require_user!

  def global
    # Fetch recent statuses that have some GPS data or bounties to act as "Truth Signals"
    statuses = Status.where.not(latitude: nil)
                     .or(Status.where.not(real_estate_price: nil))
                     .or(Status.where('bounty_amount > 0'))
                     .order(created_at: :desc)
                     .limit(100)
    
    # If no statuses match, fallback to some latest statuses
    statuses = Status.order(created_at: :desc).limit(20) if statuses.empty?

    signals = statuses.map do |status|
      {
        id: status.id,
        wave_strength: Math.log10([status.favourites_count + status.reblogs_count + (status.bounty_amount || 0), 1].max) + 1,
        category: determine_category(status),
        x: map_longitude(status.longitude),
        y: map_latitude(status.latitude),
        description: truncate_text(status.text)
      }
    end

    render json: { signals: signals }
  end

  private

  def determine_category(status)
    if status.real_estate_price.present?
      'real_estate'
    elsif status.bounty_amount.to_i > 0
      'investigating'
    elsif status.favourites_count > 0 || status.trust_votes.to_i > status.fake_votes.to_i
      'truth'
    else
      'safe'
    end
  end

  def truncate_text(text)
    ActionController::Base.helpers.strip_tags(text).to_s.truncate(40)
  rescue
    "Encrypted Signal"
  end

  def map_longitude(lng)
    return rand(10.0..90.0).round(2) if lng.blank?
    # Map -180..180 to 5..95 (padding)
    (((lng.to_f + 180) / 360.0) * 90 + 5).round(2)
  end

  def map_latitude(lat)
    return rand(10.0..90.0).round(2) if lat.blank?
    # Map 90..-90 to 5..95 (CSS top is 0 at North)
    (((90 - lat.to_f) / 180.0) * 90 + 5).round(2)
  end
end

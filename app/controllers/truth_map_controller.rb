# frozen_string_literal: true

class TruthMapController < ApplicationController
  # Simulates rendering the Dynamic Truth Map (Global View)
  def global
    # Aggregate actual `TruthNote` records
    # Grouping by Status ID and calculating average `wave_strength`.
    
    heatmap_data = Status.joins(:truth_notes)
                         .select('statuses.id, statuses.text, AVG(truth_notes.wave_strength) as avg_wave_strength')
                         .group('statuses.id, statuses.text')
                         .having('AVG(truth_notes.wave_strength) > 0')
                         .order('avg_wave_strength DESC')
                         .limit(100)

    # Format the payload for the React Canvas/Map frontend
    formatted_signals = heatmap_data.map do |status|
      {
        id: status.id.to_s,
        # Determine visual category based on strength (this logic can be expanded)
        category: status.avg_wave_strength > 2 ? 'truth' : 'investigating',
        wave_strength: status.avg_wave_strength.round(2),
        # Strip HTML tags for the floating map label
        description: ActionController::Base.helpers.strip_tags(status.text).truncate(60),
        # Simulated pseudo-coordinates for a scattered floating island look
        x: rand(10..90),
        y: rand(10..90)
      }
    end

    render json: {
      map_type: 'global',
      signals: formatted_signals,
      bridging_health: formatted_signals.any? ? (formatted_signals.sum { |s| s[:wave_strength] } / formatted_signals.length * 20).round : 0
    }
  end

  # Simulates rendering the Private Voyage Map (Crew View)
  def crew
    crew_island_data = [
      { id: 'island-alpha', status: 'verified', label: 'Tech News', wave_strength: 5.0 },
      { id: 'island-beta', status: 'investigating', label: 'Financial rumors', wave_strength: 2.1 }
    ]

    render json: {
      map_type: 'crew_voyage',
      islands: crew_island_data,
      active_bounties: 3
    }
  end
end

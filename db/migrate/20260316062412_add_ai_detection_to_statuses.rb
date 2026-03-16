# frozen_string_literal: true

class AddAiDetectionToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :ai_detected, :boolean, default: false, null: false
    add_column :statuses, :ai_confidence, :float, default: 0.0, null: false
  end
end

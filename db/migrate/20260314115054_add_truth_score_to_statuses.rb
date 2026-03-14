# frozen_string_literal: true

class AddTruthScoreToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :truth_score, :float, default: 0.0, null: false
    add_column :statuses, :is_suspicious, :boolean, default: false, null: false
  end
end

# frozen_string_literal: true

class AddSafetyMetricsToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :fake_count, :integer
    add_column :statuses, :safe_count, :integer
  end
end

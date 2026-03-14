# frozen_string_literal: true

class AddIsIncidentToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :is_incident, :boolean
  end
end

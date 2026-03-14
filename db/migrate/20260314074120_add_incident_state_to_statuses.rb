# frozen_string_literal: true

class AddIncidentStateToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :incident_state, :string, default: 'reported'
  end
end

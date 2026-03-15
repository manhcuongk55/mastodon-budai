# frozen_string_literal: true

class AddHumanZoneToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :human_zone, :boolean, default: false, null: false
  end
end

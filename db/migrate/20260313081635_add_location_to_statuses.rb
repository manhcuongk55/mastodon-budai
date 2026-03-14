# frozen_string_literal: true

class AddLocationToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :latitude, :decimal
    add_column :statuses, :longitude, :decimal
  end
end

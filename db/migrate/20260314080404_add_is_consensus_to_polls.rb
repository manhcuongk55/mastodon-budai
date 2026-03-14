# frozen_string_literal: true

class AddIsConsensusToPolls < ActiveRecord::Migration[8.1]
  def change
    add_column :polls, :is_consensus, :boolean, default: false, null: false
  end
end

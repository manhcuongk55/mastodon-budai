# frozen_string_literal: true

class AddPirateTruthFieldsToAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :accounts, :truth_berries, :integer
    add_column :accounts, :truth_bounty, :integer
    add_column :accounts, :pirate_role, :string
    add_column :accounts, :journey_milestone, :string
  end
end

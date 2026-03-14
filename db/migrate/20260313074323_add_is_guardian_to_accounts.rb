# frozen_string_literal: true

class AddIsGuardianToAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :accounts, :is_guardian, :boolean
  end
end

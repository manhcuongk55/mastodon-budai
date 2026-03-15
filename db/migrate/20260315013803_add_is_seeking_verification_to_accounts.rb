# frozen_string_literal: true

class AddIsSeekingVerificationToAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :accounts, :is_seeking_verification, :boolean, default: false, null: false
  end
end

# frozen_string_literal: true

class AddReferralToAccounts < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_column :accounts, :referral_code, :string
    add_index :accounts, :referral_code, unique: true, algorithm: :concurrently
    add_column :accounts, :referred_by_id, :bigint
    add_index :accounts, :referred_by_id, algorithm: :concurrently
  end
end

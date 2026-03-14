# frozen_string_literal: true

class AddTrustScoreToAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :accounts, :trust_score, :integer, default: 0, null: false
  end
end

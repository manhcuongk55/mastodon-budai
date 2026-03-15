# frozen_string_literal: true

class CreateMarketingClaims < ActiveRecord::Migration[8.1]
  def change
    create_table :marketing_claims do |t|
      t.references :account, null: false, foreign_key: true
      t.string :product_name
      t.text :marketing_text
      t.string :media_url
      t.string :target_url
      t.string :status, default: 'pending_review'
      t.integer :budget, default: 0
      t.decimal :crab_score, default: 0.0
      t.boolean :is_crab_verified, default: false

      t.timestamps
    end
  end
end

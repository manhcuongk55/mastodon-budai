# frozen_string_literal: true

class CreateAdCampaigns < ActiveRecord::Migration[8.1]
  def change
    create_table :ad_campaigns do |t|
      t.references :account, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.string :media_url
      t.string :target_url
      t.string :status
      t.integer :budget
      t.decimal :crab_score
      t.boolean :is_crab_verified

      t.timestamps
    end
  end
end

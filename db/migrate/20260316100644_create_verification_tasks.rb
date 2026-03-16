# frozen_string_literal: true

class CreateVerificationTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :verification_tasks do |t|
      t.references :status, null: false, foreign_key: true
      t.string :claim_type
      t.text :claim_text
      t.integer :required_verifiers
      t.integer :current_verifiers
      t.string :verification_status
      t.integer :reward_berries
      t.datetime :expires_at

      t.timestamps
    end
  end
end

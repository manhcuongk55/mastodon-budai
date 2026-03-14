# frozen_string_literal: true

class CreateTruthNotes < ActiveRecord::Migration[8.1]
  def change
    create_table :truth_notes do |t|
      t.references :status, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.text :content
      t.integer :truth_score
      t.integer :safe_score
      t.integer :fake_score
      t.float :wave_strength
      t.boolean :is_public

      t.timestamps
    end
  end
end

# frozen_string_literal: true

class CreateVerificationEvidences < ActiveRecord::Migration[8.1]
  def change
    create_table :verification_evidences do |t|
      t.references :verification_task, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.string :evidence_type
      t.string :evidence_url
      t.text :evidence_text
      t.string :vote
      t.float :confidence

      t.timestamps
    end
  end
end

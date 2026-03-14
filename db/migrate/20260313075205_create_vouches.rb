# frozen_string_literal: true

class CreateVouches < ActiveRecord::Migration[8.1]
  def change
    create_table :vouches do |t|
      t.references :account, null: false, foreign_key: { on_delete: :cascade }
      t.references :target_account, null: false, foreign_key: { to_table: :accounts, on_delete: :cascade }

      t.timestamps
    end

    add_index :vouches, [:account_id, :target_account_id], unique: true
  end
end

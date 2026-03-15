# frozen_string_literal: true

class CreateGuildMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :guild_memberships do |t|
      t.references :guild, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.string :role, default: 'member', null: false
      t.timestamps
    end
    add_index :guild_memberships, [:guild_id, :account_id], unique: true
  end
end

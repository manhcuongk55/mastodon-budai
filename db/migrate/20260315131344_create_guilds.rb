# frozen_string_literal: true

class CreateGuilds < ActiveRecord::Migration[8.1]
  def change
    create_table :guilds do |t|
      t.string :name, null: false
      t.text :description
      t.string :focus_area
      t.integer :reputation_points, default: 0, null: false
      t.references :owner, polymorphic: true, null: false
      t.timestamps
    end
    add_index :guilds, :name, unique: true
  end
end

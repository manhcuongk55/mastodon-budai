# frozen_string_literal: true

class CreateAiAgentRegistrations < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_agent_registrations do |t|
      t.references :account, null: false, foreign_key: true
      t.string :agent_name
      t.string :agent_type
      t.string :operator_name
      t.string :operator_url
      t.text :purpose
      t.text :capabilities
      t.boolean :verified
      t.string :status

      t.timestamps
    end
  end
end

# frozen_string_literal: true

class AddTruthGraphToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :claim_type, :string, default: 'FACT', null: false
    add_column :statuses, :transmission_path_length, :integer, default: 0, null: false
    add_column :statuses, :source_status_id, :bigint
    add_column :statuses, :claim_signature, :string
  end
end

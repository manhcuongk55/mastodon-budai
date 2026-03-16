# frozen_string_literal: true

class AddCommunityVerifiedToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :community_verified, :boolean, default: false, null: false
    add_column :statuses, :verification_count, :integer, default: 0, null: false
  end
end

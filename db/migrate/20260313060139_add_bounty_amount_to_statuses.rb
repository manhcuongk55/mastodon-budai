# frozen_string_literal: true

class AddBountyAmountToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :bounty_amount, :integer
  end
end

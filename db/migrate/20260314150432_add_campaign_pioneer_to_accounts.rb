# frozen_string_literal: true

class AddCampaignPioneerToAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :accounts, :campaign_pioneer, :boolean, default: false, null: false
  end
end

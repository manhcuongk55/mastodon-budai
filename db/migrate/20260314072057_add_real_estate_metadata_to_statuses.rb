# frozen_string_literal: true

class AddRealEstateMetadataToStatuses < ActiveRecord::Migration[8.1]
  def change
    add_column :statuses, :real_estate_price, :decimal
    add_column :statuses, :real_estate_area, :decimal
    add_column :statuses, :real_estate_legal_status, :string
    add_column :statuses, :real_estate_zoning, :string
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'TruthMaps' do
  describe 'GET /global' do
    it 'returns http success' do
      get '/truth_map/global'
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /crew' do
    it 'returns http success' do
      get '/truth_map/crew'
      expect(response).to have_http_status(:success)
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'LinkPortals' do
  describe 'GET /show' do
    it 'returns http success' do
      get '/link_portals/show'
      expect(response).to have_http_status(:success)
    end
  end
end

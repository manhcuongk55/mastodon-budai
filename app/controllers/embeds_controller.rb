# frozen_string_literal: true

class EmbedsController < ApplicationController
  layout 'embed'

  def show
    @hash = params[:hash]
    
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    render file: Rails.root.join('public', 'index.html'), layout: false
  end
end

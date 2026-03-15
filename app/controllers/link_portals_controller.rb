# frozen_string_literal: true

class LinkPortalsController < ApplicationController
  layout 'public'

  def show
    @hash = params[:hash]
    
    # We detect if the requester is a social media crawler
    # If yes, we render a highly-enticing, dynamic OpenGraph card.
    # If no, we let the React Router take over and render the LinkVerificationDashboard.
    user_agent = request.user_agent.to_s.downcase
    
    is_crawler = user_agent.match?(/facebookexternalhit|whatsapp|viber|zalo|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/|slackbot|vkshare|w3c_validator/i)

    if is_crawler
      # Note: In a fully relayed P2P architecture, we would query a local Gun node here.
      # For now, we generate a high-urgency generic card to force click-throughs.
      @title = "🚨 Mạng P2P Cảnh Báo: Tin tức này đang bị đánh giá tiêu cực!"
      @description = "Hàng trăm người dùng trên mạng lưới Truth Network phân tán đang tranh cãi kịch liệt về đường link này. Hãy vào ứng dụng để xem tỉ lệ [Sự Thật] / [Giả Mạo] và đóng góp tiếng nói của bạn."
      @image_url = ActionController::Base.helpers.image_url('og-truth-warning.png') rescue nil
      @url = request.original_url
      
      render template: 'link_portals/show_card', layout: false
    else
      # If it's a real human, serve the regular React SPA envelope
      # React Router will then mount the Consensus Portal component for `/portal/:hash`
      render template: 'home/index'
    end
  end
end

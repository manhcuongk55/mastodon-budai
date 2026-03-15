# frozen_string_literal: true

class ReferralsController < ApplicationController
  layout 'auth'

  def show
    @account = Account.find_by(referral_code: params[:code].to_s.upcase)
    
    if @account.present?
      # Provide Viral Share OG Headers
      @page_title = "#{@account.display_name.presence || @account.username} đang mời bạn gia nhập Băng Đảng Sự Thật!"
      @page_description = "Đăng ký qua link này để nhận ngay 10 Trái Ác Quỷ (Truth Berries) và cùng nhau chống lại tin giả. Trusking - Mạng Xã Hội Phi Tập Trung."
      @page_image = @account.avatar_original_url
      
      # Since we're in a PWA, we can render a simple HTML page with OpenGraph tags
      # that uses JavaScript to redirect to the actual signup path `/auth/sign_up?ref=CODE`
      render inline: <<~HTML
        <!DOCTYPE html>
        <html>
        <head>
          <title><%= @page_title %></title>
          <meta property="og:title" content="<%= @page_title %>" />
          <meta property="og:description" content="<%= @page_description %>" />
          <meta property="og:image" content="<%= @page_image %>" />
          <meta property="twitter:card" content="summary_large_image" />
          <script>
            window.location.href = "/auth/sign_up?ref=<%= @account.referral_code %>";
          </script>
        </head>
        <body>
          <p>Redirecting to signup...</p>
        </body>
        </html>
      HTML
    else
      redirect_to new_user_registration_path
    end
  end
end

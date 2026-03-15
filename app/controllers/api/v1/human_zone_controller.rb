# frozen_string_literal: true

class Api::V1::HumanZoneController < Api::BaseController
  before_action :require_user!, except: [:feed]

  # GET /api/v1/human_zone/feed
  # Returns statuses posted inside the Human-Only Verification Zone.
  # Accessible by everyone (read-only for non-verified users).
  def feed
    @statuses = Status.where(human_zone: true)
                      .includes(:account)
                      .order(id: :desc)
                      .limit(40)

    render json: @statuses, each_serializer: REST::StatusSerializer
  end

  # POST /api/v1/human_zone/post
  # Creates a new status inside the Human Zone.
  # Only verified humans (Guardians or trust_score >= 70) may post.
  def post
    account = current_account

    unless human_verified?(account)
      render json: { error: 'Bạn cần xác minh danh tính người thật để đăng bài tại đây. Hãy trở thành Guardian hoặc đạt Trust Score ≥ 70.' }, status: :forbidden
      return
    end

    @status = PostStatusService.new.call(
      account,
      text: human_zone_params[:text],
      human_zone: true,
      visibility: :public
    )

    render json: @status, serializer: REST::StatusSerializer
  end

  private

  def human_zone_params
    params.permit(:text)
  end

  def human_verified?(account)
    account.is_guardian == true || (account.trust_score.present? && account.trust_score >= 70)
  end
end

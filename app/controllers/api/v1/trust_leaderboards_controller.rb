# frozen_string_literal: true

class Api::V1::TrustLeaderboardsController < Api::BaseController
  before_action :require_user!

  def index
    # Fetch top 50 trusted users, excluding suspended users
    @accounts = Account
                  .without_suspended
                  .where('trust_score > 0 OR truth_berries > 0')
                  .order(trust_score: :desc, truth_berries: :desc, id: :desc)
                  .limit(50)

    render json: @accounts, each_serializer: REST::AccountSerializer
  end
end

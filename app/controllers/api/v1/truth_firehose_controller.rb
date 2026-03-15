# frozen_string_literal: true

class Api::V1::TruthFirehoseController < Api::BaseController
  include Authorization

  # Require an API Token (simulating a Data License for AI models)
  before_action -> { doorkeeper_authorize! :read, :'read:statuses' }
  before_action :require_user!

  def index
    # AI-Ready Truth Firehose Logic
    # 1. Strictly filter out anything suspicious
    # 2. Only serve FACTs (remove OPINION, ADVICE, RUMOR)
    # 3. Only serve posts with a TruthScore >= 1.0 (verified presence)
    # 4. Order by highest truth score or recency
    
    @statuses = Status.where(is_suspicious: false)
                      .where(claim_type: 'FACT')
                      .where('truth_score >= ?', 1.0)
                      .order(truth_score: :desc, created_at: :desc)
                      .limit(100) # Maximum batch size per AI polling cycle

    # Preload essential associations for performance
    @statuses = @statuses.includes(:account, :media_attachments, :truth_notes)

    render json: @statuses, each_serializer: REST::TruthFirehoseSerializer
  end
end

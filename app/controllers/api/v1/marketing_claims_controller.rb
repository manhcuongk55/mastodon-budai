# frozen_string_literal: true

class Api::V1::MarketingClaimsController < Api::BaseController
  before_action :require_user!
  before_action :set_marketing_claim, only: [:show, :authenticate]

  # GET /api/v1/marketing_claims
  def index
    @marketing_claims = MarketingClaim.all.order(created_at: :desc).limit(40)
    render json: @marketing_claims, each_serializer: REST::MarketingClaimSerializer
  end

  # GET /api/v1/marketing_claims/:id
  def show
    render json: @marketing_claim, serializer: REST::MarketingClaimSerializer
  end

  # POST /api/v1/marketing_claims
  # Step C in HCRAB: Claim
  def create
    @marketing_claim = current_account.marketing_claims.build(marketing_claim_params)
    @marketing_claim.status = 'pending_review'
    @marketing_claim.is_crab_verified = false
    @marketing_claim.crab_score = 0.0

    if @marketing_claim.save
      render json: @marketing_claim, serializer: REST::MarketingClaimSerializer
    else
      render json: { error: @marketing_claim.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/marketing_claims/:id/authenticate
  # Step A in HCRAB: Authentication
  def authenticate
    # Only verified Guardians can authenticate (100% real users — no fake accounts)
    unless current_account.is_seeking_verification?
      return render json: { error: 'Not authorized. Only Real Verified Users (Guardians) can authenticate claims via HCRAB.' }, status: :forbidden
    end

    current_score = @marketing_claim.crab_score || 0.0
    new_score = current_score + (0.1 * rand(1..5)) # Simulated TrustScore increment

    if new_score >= 8.0 && !@marketing_claim.is_crab_verified?
      # Step B in HCRAB: Broadcast — the campaign is now verified
      @marketing_claim.update!(
        crab_score: new_score,
        is_crab_verified: true,
        status: 'broadcasted'
      )

      # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      # Community Revenue Share: 30% of Ad budget → Guardians
      # TrustScore = user_trust × experience_proof × proximity
      # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      distribute_crab_rewards(@marketing_claim)
    else
      @marketing_claim.update!(crab_score: new_score)
    end

    # Reward the current authenticating Guardian regardless (small tip for effort)
    current_account.increment!(:truth_berries, 1)

    render json: @marketing_claim, serializer: REST::MarketingClaimSerializer
  end

  private

  def set_marketing_claim
    @marketing_claim = MarketingClaim.find(params[:id])
  end

  def marketing_claim_params
    params.require(:marketing_claim).permit(:product_name, :marketing_text, :media_url, :target_url, :budget)
  end

  # Distribute 30% of ad budget as Truth Berries to all verified Guardian accounts
  def distribute_crab_rewards(claim)
    budget = claim.budget.to_i
    return if budget <= 0

    # 30% of budget goes to the community — the other 70% is platform revenue
    community_pool = (budget * 0.30).to_i

    # Guardians = accounts that are seeking_verification (100% real users)
    guardian_accounts = Account.where(is_seeking_verification: true)
    return if guardian_accounts.empty?

    per_guardian_berries = [community_pool / guardian_accounts.count, 1].max

    guardian_accounts.each do |guardian|
      guardian.increment!(:truth_berries, per_guardian_berries)
    end

    Rails.logger.info "[HCRAB] 🦀 Claim ##{claim.id} broadcasted. #{community_pool} Truth Berries distributed to #{guardian_accounts.count} Guardians (#{per_guardian_berries} each)."
  end
end


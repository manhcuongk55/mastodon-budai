# frozen_string_literal: true

class Api::V1::VerificationTasksController < Api::BaseController
  before_action :require_user!, except: [:index, :show]
  before_action :set_task, only: [:show, :submit_evidence]

  # GET /api/v1/verification_tasks
  # List open verification tasks for the community
  def index
    @tasks = VerificationTask.open_tasks
                              .includes(:status, :verification_evidences)
                              .order(created_at: :desc)
                              .limit(30)

    if params[:claim_type].present?
      @tasks = @tasks.by_type(params[:claim_type])
    end

    render json: @tasks.map { |t| serialize_task(t) }
  end

  # GET /api/v1/verification_tasks/:id
  def show
    render json: serialize_task(@task, include_evidences: true)
  end

  # POST /api/v1/verification_tasks
  # Create a new verification task from a status
  def create
    status = Status.find(params[:status_id])

    task = VerificationTask.new(
      status: status,
      claim_type: params[:claim_type] || 'content',
      claim_text: params[:claim_text] || status.text&.truncate(500),
      required_verifiers: params[:required_verifiers] || 5,
      reward_berries: params[:reward_berries] || 10
    )

    if task.save
      render json: serialize_task(task), status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/verification_tasks/:id/evidence
  # Submit evidence for a verification task
  def submit_evidence
    # Only verified users can submit evidence
    unless current_account.is_guardian || (current_account.trust_score.present? && current_account.trust_score >= 30)
      return render json: {
        error: 'Bạn cần Trust Score ≥ 30 hoặc là Guardian để tham gia xác minh.'
      }, status: :forbidden
    end

    evidence = @task.verification_evidences.new(
      account: current_account,
      evidence_type: evidence_params[:evidence_type] || 'text',
      evidence_url: evidence_params[:evidence_url],
      evidence_text: evidence_params[:evidence_text],
      vote: evidence_params[:vote] || 'confirm',
      confidence: evidence_params[:confidence] || 0.8
    )

    if evidence.save
      # Reward participation
      current_account.increment!(:truth_berries, 2)

      render json: {
        evidence: serialize_evidence(evidence),
        task: serialize_task(@task.reload),
        reward: '+2 Truth Berries 🫐',
      }, status: :created
    else
      render json: { errors: evidence.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/verification_tasks/my_contributions
  # Show current user's verification history
  def my_contributions
    evidences = VerificationEvidence.where(account: current_account)
                                    .includes(verification_task: :status)
                                    .order(created_at: :desc)
                                    .limit(20)

    render json: {
      total_contributions: VerificationEvidence.where(account: current_account).count,
      total_berries_earned: current_account.truth_berries,
      recent: evidences.map { |e| serialize_evidence(e, include_task: true) },
    }
  end

  # GET /api/v1/verification_tasks/leaderboard
  # Top verifiers in the community
  def leaderboard
    top_verifiers = VerificationEvidence
                      .select('account_id, COUNT(*) as evidence_count')
                      .group(:account_id)
                      .order('evidence_count DESC')
                      .limit(20)

    leaderboard_data = top_verifiers.map.with_index(1) do |entry, rank|
      account = Account.find(entry.account_id)
      {
        rank: rank,
        account_id: account.id.to_s,
        display_name: account.display_name,
        acct: account.acct,
        avatar: account.avatar&.url,
        evidence_count: entry.evidence_count,
        truth_berries: account.truth_berries || 0,
        is_guardian: account.is_guardian || false,
      }
    end

    render json: { leaderboard: leaderboard_data }
  end

  private

  def set_task
    @task = VerificationTask.find(params[:id])
  end

  def evidence_params
    params.permit(:evidence_type, :evidence_url, :evidence_text, :vote, :confidence)
  end

  def serialize_task(task, include_evidences: false)
    data = {
      id: task.id.to_s,
      claim_type: task.claim_type,
      claim_text: task.claim_text,
      required_verifiers: task.required_verifiers,
      current_verifiers: task.current_verifiers,
      verification_status: task.verification_status,
      reward_berries: task.reward_berries,
      progress: task.progress_percentage,
      expires_at: task.expires_at,
      created_at: task.created_at,
      status_id: task.status_id.to_s,
      status_content: task.status&.text&.truncate(200),
      status_account: task.status&.account&.display_name,
      status_avatar: task.status&.account&.avatar&.url,
    }

    if include_evidences
      data[:evidences] = task.verification_evidences.includes(:account).map { |e| serialize_evidence(e) }
      data[:confirm_count] = task.verification_evidences.where(vote: 'confirm').count
      data[:deny_count] = task.verification_evidences.where(vote: 'deny').count
      data[:unsure_count] = task.verification_evidences.where(vote: 'unsure').count
    end

    data
  end

  def serialize_evidence(evidence, include_task: false)
    data = {
      id: evidence.id.to_s,
      evidence_type: evidence.evidence_type,
      evidence_url: evidence.evidence_url,
      evidence_text: evidence.evidence_text,
      vote: evidence.vote,
      confidence: evidence.confidence,
      created_at: evidence.created_at,
      account_name: evidence.account&.display_name,
      account_avatar: evidence.account&.avatar&.url,
      account_acct: evidence.account&.acct,
    }

    if include_task
      data[:task] = {
        id: evidence.verification_task_id.to_s,
        claim_text: evidence.verification_task&.claim_text&.truncate(100),
        verification_status: evidence.verification_task&.verification_status,
      }
    end

    data
  end
end

# frozen_string_literal: true

class Api::V1::AiAgentRegistryController < Api::BaseController
  before_action :require_user!, except: [:index, :show]

  # GET /api/v1/ai_agent_registry
  # List all registered AI agents (public transparency)
  def index
    registrations = AiAgentRegistration.approved
                                        .includes(:account)
                                        .order(created_at: :desc)
                                        .limit(50)

    render json: registrations, each_serializer: REST::AiAgentRegistrationSerializer
  end

  # GET /api/v1/ai_agent_registry/:id
  def show
    registration = AiAgentRegistration.find(params[:id])
    render json: registration, serializer: REST::AiAgentRegistrationSerializer
  end

  # POST /api/v1/ai_agent_registry
  # Register the current account as an AI agent
  def create
    registration = AiAgentRegistration.new(registration_params)
    registration.account = current_account
    registration.status = 'pending'
    registration.verified = false

    if registration.save
      render json: registration, serializer: REST::AiAgentRegistrationSerializer, status: :created
    else
      render json: { errors: registration.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/ai_agent_registry/stats
  # Public statistics about AI agents on the platform
  def stats
    render json: {
      total_registered: AiAgentRegistration.approved.count,
      total_pending: AiAgentRegistration.pending.count,
      by_type: AiAgentRegistration.approved.group(:agent_type).count,
      recent_registrations: AiAgentRegistration.approved.order(created_at: :desc).limit(5).map do |r|
        {
          id: r.id,
          agent_name: r.agent_name,
          agent_type: r.agent_type,
          operator_name: r.operator_name,
          created_at: r.created_at,
        }
      end,
    }
  end

  private

  def registration_params
    params.permit(:agent_name, :agent_type, :operator_name, :operator_url, :purpose, :capabilities)
  end
end

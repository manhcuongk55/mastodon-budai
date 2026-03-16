# frozen_string_literal: true

class REST::AiAgentRegistrationSerializer < ActiveModel::Serializer
  attributes :id, :agent_name, :agent_type, :operator_name, :operator_url,
             :purpose, :capabilities, :verified, :status, :created_at

  belongs_to :account, serializer: REST::AccountSerializer

  def id
    object.id.to_s
  end
end

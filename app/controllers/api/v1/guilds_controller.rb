# frozen_string_literal: true

class Api::V1::GuildsController < Api::BaseController
  before_action :require_user!
  before_action :set_guild, only: [:show, :join, :leave]

  # GET /api/v1/guilds — Leaderboard sorted by reputation
  def index
    @guilds = Guild.order(reputation_points: :desc).limit(50)
    render json: @guilds, each_serializer: REST::GuildSerializer
  end

  # GET /api/v1/guilds/:id
  def show
    render json: @guild, serializer: REST::GuildSerializer
  end

  # POST /api/v1/guilds — Create a new Truth Hunter Guild
  def create
    @guild = Guild.new(guild_params)
    @guild.owner = current_account

    if @guild.save
      # Creator becomes a leader automatically
      @guild.guild_memberships.create!(account: current_account, role: 'leader')
      render json: @guild, serializer: REST::GuildSerializer
    else
      render json: { error: @guild.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/guilds/:id/join
  def join
    membership = @guild.guild_memberships.build(account: current_account, role: 'member')
    if membership.save
      render json: @guild, serializer: REST::GuildSerializer
    else
      render json: { error: membership.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/guilds/:id/leave
  def leave
    membership = @guild.guild_memberships.find_by(account: current_account)
    membership&.destroy
    render json: { success: true }
  end

  private

  def set_guild
    @guild = Guild.find(params[:id])
  end

  def guild_params
    params.require(:guild).permit(:name, :description, :focus_area)
  end
end

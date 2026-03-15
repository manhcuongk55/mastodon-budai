# frozen_string_literal: true

class REST::GuildSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :focus_area, :reputation_points, :member_count, :created_at

  def id
    object.id.to_s
  end

  def member_count
    object.guild_memberships.count
  end
end

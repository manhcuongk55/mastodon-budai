# frozen_string_literal: true

# == Schema Information
#
# Table name: guilds
#
#  id                :bigint(8)        not null, primary key
#  description       :text
#  focus_area        :string
#  name              :string           not null
#  owner_type        :string           not null
#  reputation_points :integer          default(0), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  owner_id          :bigint(8)        not null
#
class Guild < ApplicationRecord
  belongs_to :owner, polymorphic: true
  has_many :guild_memberships, dependent: :destroy
  has_many :members, through: :guild_memberships, source: :account

  validates :name, presence: true, uniqueness: true, length: { minimum: 3, maximum: 80 }
  validates :focus_area, presence: true

  def award_reputation!(points = 10)
    increment!(:reputation_points, points)
  end

  def member_count
    guild_memberships.count
  end
end

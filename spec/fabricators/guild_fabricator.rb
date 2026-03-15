# frozen_string_literal: true

Fabricator(:guild) do
  name              'MyString'
  description       'MyText'
  focus_area        'MyString'
  reputation_points 1
  owner             nil
end

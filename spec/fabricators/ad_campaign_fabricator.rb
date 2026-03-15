# frozen_string_literal: true

Fabricator(:ad_campaign) do
  account          nil
  title            'MyString'
  description      'MyText'
  media_url        'MyString'
  target_url       'MyString'
  status           'MyString'
  budget           1
  crab_score       '9.99'
  is_crab_verified false
end

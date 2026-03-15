# frozen_string_literal: true

Fabricator(:marketing_claim) do
  account          nil
  product_name     'MyString'
  marketing_text   'MyText'
  media_url        'MyString'
  target_url       'MyString'
  status           'MyString'
  budget           1
  crab_score       '9.99'
  is_crab_verified false
end

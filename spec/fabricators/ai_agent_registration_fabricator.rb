# frozen_string_literal: true

Fabricator(:ai_agent_registration) do
  account       nil
  agent_name    'MyString'
  agent_type    'MyString'
  operator_name 'MyString'
  operator_url  'MyString'
  purpose       'MyText'
  capabilities  'MyText'
  verified      false
  status        'MyString'
end

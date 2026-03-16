# frozen_string_literal: true

Fabricator(:verification_task) do
  status              nil
  claim_type          'MyString'
  claim_text          'MyText'
  required_verifiers  1
  current_verifiers   1
  verification_status 'MyString'
  reward_berries      1
  expires_at          '2026-03-16 17:06:45'
end

# frozen_string_literal: true

Fabricator(:verification_evidence) do
  verification_task nil
  account           nil
  evidence_type     'MyString'
  evidence_url      'MyString'
  evidence_text     'MyText'
  vote              'MyString'
  confidence        1.5
end

# frozen_string_literal: true

Fabricator(:truth_note) do
  status        nil
  account       nil
  content       'MyText'
  truth_score   1
  safe_score    1
  fake_score    1
  wave_strength 1.5
  is_public     false
end

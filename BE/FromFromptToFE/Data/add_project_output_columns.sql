-- Add columns to project_outputs for storing generated code (run once on existing DB).
-- Nếu bảng chỉ có id, project_id, version, status thì chạy cả block dưới.
ALTER TABLE project_outputs
  ADD COLUMN IF NOT EXISTS triggered_by uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS system_prompt text,
  ADD COLUMN IF NOT EXISTS user_prompt text,
  ADD COLUMN IF NOT EXISTS prompt_history text,
  ADD COLUMN IF NOT EXISTS generated_tsx text,
  ADD COLUMN IF NOT EXISTS generated_html text,
  ADD COLUMN IF NOT EXISTS step_output text,
  ADD COLUMN IF NOT EXISTS generated_preview_image text;

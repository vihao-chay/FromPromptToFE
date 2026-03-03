-- Add generated code columns to projects table (run once on existing DB).
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS generated_tsx text,
  ADD COLUMN IF NOT EXISTS generated_html text;

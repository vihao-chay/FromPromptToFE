-- Add GitHubAccessToken column to users table to enable pushing code to GitHub on behalf of user.
-- Run this script once on your database.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'GitHubAccessToken'
    ) THEN
        ALTER TABLE users ADD COLUMN "GitHubAccessToken" TEXT NULL;
        RAISE NOTICE 'Column GitHubAccessToken added to users table.';
    ELSE
        RAISE NOTICE 'Column GitHubAccessToken already exists.';
    END IF;
END $$;

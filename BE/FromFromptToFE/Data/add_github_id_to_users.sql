-- Add GitHubId column to users table for GitHub OAuth authentication
-- Run this script on your database to enable GitHub sign-in feature

-- Check if column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'GitHubId'
    ) THEN
        -- Add GitHubId column
        ALTER TABLE users ADD COLUMN "GitHubId" TEXT NULL;
        
        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_users_github_id ON users("GitHubId");
        
        RAISE NOTICE 'Column GitHubId added successfully to users table';
    ELSE
        RAISE NOTICE 'Column GitHubId already exists in users table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'GitHubId';

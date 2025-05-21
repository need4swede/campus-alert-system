-- Add Microsoft ID column to users table
ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255);

-- Create an index for faster lookups
CREATE INDEX idx_users_microsoft_id ON users(microsoft_id);

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN users.microsoft_id IS 'Microsoft account ID for OAuth authentication';

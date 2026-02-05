-- =================================================================
-- MIGRATION: Add and Set subscription_expires_at for gyms
-- Run this in Supabase SQL Editor
-- =================================================================

-- Step 1: Add the column if it doesn't exist
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Update all gyms that have NULL subscription_expires_at
-- Sets their expiration to 1 year from their creation date
UPDATE gyms
SET subscription_expires_at = created_at + INTERVAL '1 year',
    updated_at = NOW()
WHERE subscription_expires_at IS NULL;

-- Step 3: Verify the update
SELECT id, name, created_at, subscription_expires_at,
       EXTRACT(DAY FROM (subscription_expires_at - NOW())) as days_remaining
FROM gyms;

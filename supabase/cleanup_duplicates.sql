-- =====================================================
-- CLEANUP DUPLICATE WORKOUT & DIET PLANS
-- Run this in Supabase SQL Editor to remove duplicates
-- =====================================================

-- This script will keep only ONE copy of each plan (the oldest one)
-- and delete all duplicates

BEGIN;

-- 1. Delete duplicate diet plan meals first (they reference diet_plans)
DELETE FROM diet_plan_meals 
WHERE diet_plan_id IN (
    SELECT id FROM (
        SELECT id,
               name,
               ROW_NUMBER() OVER (PARTITION BY name, gym_id ORDER BY created_at ASC) as rn
        FROM diet_plans
    ) sub
    WHERE rn > 1
);

-- 2. Delete duplicate diet plans (keep the first/oldest of each name)
DELETE FROM diet_plans 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               name,
               ROW_NUMBER() OVER (PARTITION BY name, gym_id ORDER BY created_at ASC) as rn
        FROM diet_plans
    ) sub
    WHERE rn > 1
);

-- 3. Delete duplicate workout exercises first (they reference workout_plans)
DELETE FROM workout_exercises 
WHERE workout_plan_id IN (
    SELECT id FROM (
        SELECT id,
               name,
               ROW_NUMBER() OVER (PARTITION BY name, gym_id ORDER BY created_at ASC) as rn
        FROM workout_plans
    ) sub
    WHERE rn > 1
);

-- 4. Delete duplicate workout plans (keep the first/oldest of each name)
DELETE FROM workout_plans 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               name,
               ROW_NUMBER() OVER (PARTITION BY name, gym_id ORDER BY created_at ASC) as rn
        FROM workout_plans
    ) sub
    WHERE rn > 1
);

COMMIT;

-- Verify results
SELECT 'Diet Plans' as type, COUNT(*) as count FROM diet_plans
UNION ALL
SELECT 'Workout Plans' as type, COUNT(*) as count FROM workout_plans;

-- Check for any remaining duplicates
SELECT 'Remaining Duplicate Diet Plans' as check_type, name, COUNT(*) as count 
FROM diet_plans 
GROUP BY name 
HAVING COUNT(*) > 1

UNION ALL

SELECT 'Remaining Duplicate Workout Plans' as check_type, name, COUNT(*) as count 
FROM workout_plans 
GROUP BY name 
HAVING COUNT(*) > 1;

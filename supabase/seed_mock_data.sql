-- =================================================================
-- SEED MOCK DATA: REALISTIC WORKOUTS & DIETS
-- Run this in Supabase SQL Editor
-- =================================================================

DO $$
DECLARE
    v_gym_id UUID;
    v_trainer_id UUID;
    v_workout_id_1 UUID;
    v_workout_id_2 UUID;
    v_diet_id_1 UUID;
    v_diet_id_2 UUID;
BEGIN
    -- 1. Fetch Context (First Gym & Trainer/Admin)
    SELECT id INTO v_gym_id FROM gyms LIMIT 1;
    SELECT id INTO v_trainer_id FROM users WHERE role IN ('trainer', 'admin') AND gym_id = v_gym_id LIMIT 1;

    IF v_gym_id IS NULL OR v_trainer_id IS NULL THEN
        RAISE NOTICE 'Skipping seed: No Gym or Trainer found.';
        RETURN;
    END IF;

    -- =============================================================
    -- WORKOUT PLANS
    -- =============================================================
    
    -- Plan A: 5x5 Strength
    INSERT INTO workout_plans (name, description, created_by, gym_id, difficulty, duration_weeks, is_template)
    VALUES (
        'StrongLifts 5x5', 
        'Classic compound lift program for building raw strength. Focus on Squats, Deadlifts, and Bench Press.', 
        v_trainer_id, 
        v_gym_id, 
        'beginner', 
        12,
        true
    ) RETURNING id INTO v_workout_id_1;

    -- Exercises for Plan A
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, sets, reps, rest_seconds, exercise_order) VALUES
    (v_workout_id_1, 'monday', 'Barbell Squat', 5, 5, 180, 1),
    (v_workout_id_1, 'monday', 'Bench Press', 5, 5, 120, 2),
    (v_workout_id_1, 'monday', 'Barbell Row', 5, 5, 120, 3),
    (v_workout_id_1, 'wednesday', 'Barbell Squat', 5, 5, 180, 1),
    (v_workout_id_1, 'wednesday', 'Overhead Press', 5, 5, 120, 2),
    (v_workout_id_1, 'wednesday', 'Deadlift', 1, 5, 180, 3);

    -- Plan B: HIIT Torch
    INSERT INTO workout_plans (name, description, created_by, gym_id, difficulty, duration_weeks, is_template)
    VALUES (
        'HIIT Fat Torch', 
        'High intensity interval training designed to max out heart rate and burn calories.', 
        v_trainer_id, 
        v_gym_id, 
        'advanced', 
        4,
        true
    ) RETURNING id INTO v_workout_id_2;

    -- Exercises for Plan B
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, sets, reps, rest_seconds, exercise_order) VALUES
    (v_workout_id_2, 'monday', 'Burpees', 4, 15, 30, 1),
    (v_workout_id_2, 'monday', 'Mountain Climbers', 4, 30, 30, 2),
    (v_workout_id_2, 'monday', 'Box Jumps', 4, 12, 45, 3),
    (v_workout_id_2, 'friday', 'Sprints', 10, 1, 60, 1);

    -- =============================================================
    -- DIET PLANS
    -- =============================================================

    -- Diet A: Muscle Gain
    INSERT INTO diet_plans (name, description, created_by, gym_id, diet_preference, total_calories, is_template)
    VALUES (
        'Lean Bulk', 
        'High protein, moderate carb diet for gaining lean muscle mass.', 
        v_trainer_id, 
        v_gym_id, 
        'non_vegetarian', 
        2800,
        true
    ) RETURNING id INTO v_diet_id_1;

    -- Meals for Diet A
    INSERT INTO diet_plan_meals (diet_plan_id, time_of_day, meal_name, foods, calories, protein_g, carbs_g, fats_g) VALUES
    (v_diet_id_1, 'breakfast', 'Oats & Whey', '{"oats": "80g", "whey": "1 scoop", "berries": "50g"}', 450, 30, 60, 8),
    (v_diet_id_1, 'lunch', 'Chicken Rice Bowl', '{"chicken_breast": "150g", "brown_rice": "200g", "broccoli": "100g"}', 600, 40, 70, 10),
    (v_diet_id_1, 'dinner', 'Salmon & Asparagus', '{"salmon": "200g", "asparagus": "150g", "sweet_potato": "150g"}', 700, 45, 50, 25);

    -- Diet B: Keto Cut
    INSERT INTO diet_plans (name, description, created_by, gym_id, diet_preference, total_calories, is_template)
    VALUES (
        'Strict Keto', 
        'Low carb, high fat diet for rapid weight loss.', 
        v_trainer_id, 
        v_gym_id, 
        'vegetarian', 
        1800,
        true
    ) RETURNING id INTO v_diet_id_2;

    -- Meals for Diet B
    INSERT INTO diet_plan_meals (diet_plan_id, time_of_day, meal_name, foods, calories, protein_g, carbs_g, fats_g) VALUES
    (v_diet_id_2, 'breakfast', 'Keto Omelette', '{"eggs": 3, "cheese": "50g", "spinach": "handful"}', 500, 25, 2, 40),
    (v_diet_id_2, 'lunch', 'Avocado Salad', '{"avocado": 1, "walnuts": "30g", "feta": "50g", "greens": "bowl"}', 600, 15, 8, 55);

END $$;

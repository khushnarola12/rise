-- =====================================================
-- WORKOUT & DIET PLANS SEED DATA
-- Run this after setting up your gym
-- =====================================================

-- Get the first gym ID (update this if you have multiple gyms)
DO $$
DECLARE
    gym_uuid UUID;
    admin_uuid UUID;
    -- Workout plan IDs
    wp1 UUID; wp2 UUID; wp3 UUID; wp4 UUID; wp5 UUID;
    wp6 UUID; wp7 UUID; wp8 UUID; wp9 UUID; wp10 UUID;
    wp11 UUID; wp12 UUID; wp13 UUID; wp14 UUID; wp15 UUID;
    wp16 UUID; wp17 UUID; wp18 UUID; wp19 UUID; wp20 UUID;
    wp21 UUID; wp22 UUID; wp23 UUID; wp24 UUID; wp25 UUID;
    wp26 UUID; wp27 UUID; wp28 UUID; wp29 UUID; wp30 UUID;
    -- Diet plan IDs
    dp1 UUID; dp2 UUID; dp3 UUID; dp4 UUID; dp5 UUID;
    dp6 UUID; dp7 UUID; dp8 UUID; dp9 UUID; dp10 UUID;
    dp11 UUID; dp12 UUID; dp13 UUID; dp14 UUID; dp15 UUID;
    dp16 UUID; dp17 UUID; dp18 UUID; dp19 UUID; dp20 UUID;
    dp21 UUID; dp22 UUID; dp23 UUID; dp24 UUID; dp25 UUID;
    dp26 UUID; dp27 UUID; dp28 UUID; dp29 UUID; dp30 UUID;
BEGIN
    -- Get first gym
    SELECT id INTO gym_uuid FROM gyms LIMIT 1;
    -- Get first admin/trainer
    SELECT id INTO admin_uuid FROM users WHERE role IN ('admin', 'trainer', 'superuser') LIMIT 1;

    IF gym_uuid IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;

    -- =====================================================
    -- CLEANUP: Remove existing template plans to prevent duplicates
    -- =====================================================
    RAISE NOTICE 'Cleaning up existing template plans...';
    
    -- Delete workout exercises for template plans
    DELETE FROM workout_exercises WHERE workout_plan_id IN (
        SELECT id FROM workout_plans WHERE is_template = true AND gym_id = gym_uuid
    );
    
    -- Delete template workout plans
    DELETE FROM workout_plans WHERE is_template = true AND gym_id = gym_uuid;
    
    -- Delete diet plan meals for template plans
    DELETE FROM diet_plan_meals WHERE diet_plan_id IN (
        SELECT id FROM diet_plans WHERE is_template = true AND gym_id = gym_uuid
    );
    
    -- Delete template diet plans
    DELETE FROM diet_plans WHERE is_template = true AND gym_id = gym_uuid;
    
    RAISE NOTICE 'Cleanup complete. Inserting fresh template plans...';

    -- =====================================================
    -- WORKOUT PLANS (30 Plans)
    -- =====================================================

    -- 1. Beginner Full Body
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Beginner Full Body Blast', 'Perfect starting program for gym newcomers. Full body workouts 3x per week.', 'beginner', 4, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp1;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp1, 'monday', 'Goblet Squat', 'Hold dumbbell at chest, squat deep', 3, 12, 60, 1, 'https://www.youtube.com/watch?v=MxsFDhcyFyE'),
    (wp1, 'monday', 'Dumbbell Bench Press', 'Flat bench, press dumbbells up', 3, 10, 60, 2, 'https://www.youtube.com/watch?v=VmB1G1K7v94'),
    (wp1, 'monday', 'Lat Pulldown', 'Wide grip, pull to chest', 3, 12, 60, 3, 'https://www.youtube.com/watch?v=CAwf7n6Luuc'),
    (wp1, 'monday', 'Plank', 'Hold position with tight core', 3, 30, 45, 4, 'https://www.youtube.com/watch?v=ASdvN_XEl_c'),
    (wp1, 'wednesday', 'Leg Press', 'Feet shoulder width, push through heels', 3, 12, 60, 1, 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'),
    (wp1, 'wednesday', 'Seated Shoulder Press', 'Press dumbbells overhead', 3, 10, 60, 2, 'https://www.youtube.com/watch?v=qEwKCR5JCog'),
    (wp1, 'wednesday', 'Seated Row', 'Pull handle to stomach', 3, 12, 60, 3, 'https://www.youtube.com/watch?v=GZbfZ033f74'),
    (wp1, 'friday', 'Romanian Deadlift', 'Hinge at hips, slight knee bend', 3, 10, 60, 1, 'https://www.youtube.com/watch?v=7j-2w4-P14I'),
    (wp1, 'friday', 'Push-ups', 'Full range of motion', 3, 10, 45, 2, 'https://www.youtube.com/watch?v=IODxDxX7oi4'),
    (wp1, 'friday', 'Bicep Curls', 'Controlled movement', 3, 12, 45, 3, 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo');

    -- 2. Push Pull Legs - Beginner
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Push Pull Legs Starter', 'Classic PPL split adapted for beginners. Train 3 days per week.', 'beginner', 6, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp2;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp2, 'monday', 'Flat Barbell Bench Press', 'Main chest movement', 4, 8, 90, 1, 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
    (wp2, 'monday', 'Incline Dumbbell Press', 'Upper chest focus', 3, 10, 60, 2, 'https://www.youtube.com/watch?v=8iPEnn-ltC8'),
    (wp2, 'monday', 'Overhead Press', 'Standing shoulder press', 3, 8, 60, 3, 'https://www.youtube.com/watch?v=2yjwXTZQDDI'),
    (wp2, 'monday', 'Tricep Pushdown', 'Cable tricep isolation', 3, 12, 45, 4, 'https://www.youtube.com/watch?v=2-LAMcpzODU'),
    (wp2, 'wednesday', 'Barbell Row', 'Bent over, pull to stomach', 4, 8, 90, 1, 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ'),
    (wp2, 'wednesday', 'Pull-ups', 'Wide grip or assisted', 3, 8, 60, 2, 'https://www.youtube.com/watch?v=eGo4IYlbE5g'),
    (wp2, 'wednesday', 'Face Pulls', 'Rear delt and upper back', 3, 15, 45, 3, 'https://www.youtube.com/watch?v=rep-qVOkqgk'),
    (wp2, 'wednesday', 'Barbell Curl', 'Bicep builder', 3, 10, 45, 4, 'https://www.youtube.com/watch?v=kwG2ipFRgfo'),
    (wp2, 'friday', 'Barbell Squat', 'King of leg exercises', 4, 8, 120, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp2, 'friday', 'Leg Curl', 'Hamstring isolation', 3, 12, 60, 2, 'https://www.youtube.com/watch?v=1Tq3QdYUuHs'),
    (wp2, 'friday', 'Calf Raises', 'Standing calf machine', 4, 15, 45, 3, 'https://www.youtube.com/watch?v=-M4-G8p8fmc');

    -- 3. Upper Lower Split
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Upper Lower Power', 'Alternating upper and lower body for balanced development.', 'intermediate', 8, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp3;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp3, 'monday', 'Bench Press', 'Flat barbell press', 4, 6, 120, 1, 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
    (wp3, 'monday', 'Weighted Pull-ups', 'Add weight belt', 4, 6, 120, 2, 'https://www.youtube.com/watch?v=eGo4IYlbE5g'),
    (wp3, 'monday', 'Overhead Press', 'Standing military press', 3, 8, 90, 3, 'https://www.youtube.com/watch?v=2yjwXTZQDDI'),
    (wp3, 'monday', 'Barbell Row', 'Heavy rows', 3, 8, 90, 4, 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ'),
    (wp3, 'tuesday', 'Squat', 'Back squat', 4, 6, 120, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp3, 'tuesday', 'Deadlift', 'Conventional deadlift', 4, 5, 180, 2, 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
    (wp3, 'tuesday', 'Leg Press', 'High and wide stance', 3, 10, 90, 3, 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'),
    (wp3, 'tuesday', 'Leg Curl', 'Lying leg curl', 3, 12, 60, 4, 'https://www.youtube.com/watch?v=1Tq3QdYUuHs');

    -- 4. Chest & Triceps Focus
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Chest & Triceps Destroyer', 'Intense chest and triceps specialization program.', 'intermediate', 6, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp4;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp4, 'monday', 'Flat Bench Press', 'Barbell, full ROM', 5, 5, 120, 1, 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
    (wp4, 'monday', 'Incline Dumbbell Press', '30 degree incline', 4, 8, 90, 2, 'https://www.youtube.com/watch?v=8iPEnn-ltC8'),
    (wp4, 'monday', 'Cable Flyes', 'High to low', 3, 12, 60, 3, 'https://www.youtube.com/watch?v=Iwe6AmxVf7o'),
    (wp4, 'monday', 'Dips', 'Lean forward for chest', 3, 10, 60, 4, 'https://www.youtube.com/watch?v=2z8JmcrW-As'),
    (wp4, 'monday', 'Close Grip Bench', 'Tricep emphasis', 4, 8, 90, 5, 'https://www.youtube.com/watch?v=nEF0bv2FW94'),
    (wp4, 'monday', 'Skull Crushers', 'EZ bar', 3, 12, 60, 6, 'https://www.youtube.com/watch?v=d_KZxkY_0cM'),
    (wp4, 'thursday', 'Decline Bench Press', 'Lower chest', 4, 8, 90, 1, 'https://www.youtube.com/watch?v=LfyQBUKR8SE'),
    (wp4, 'thursday', 'Machine Chest Press', 'Constant tension', 3, 12, 60, 2, 'https://www.youtube.com/watch?v=xUm0BiZCWlQ'),
    (wp4, 'thursday', 'Overhead Tricep Extension', 'Cable or dumbbell', 3, 12, 60, 3, 'https://www.youtube.com/watch?v=_gsUck-7M74');

    -- 5. Back & Biceps Builder
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Back & Biceps Builder', 'Develop a wide, thick back with peaked biceps.', 'intermediate', 6, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp5;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp5, 'tuesday', 'Deadlift', 'Conventional stance', 4, 5, 180, 1, 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
    (wp5, 'tuesday', 'Weighted Pull-ups', 'Wide grip', 4, 6, 90, 2, 'https://www.youtube.com/watch?v=eGo4IYlbE5g'),
    (wp5, 'tuesday', 'T-Bar Row', 'Squeeze at top', 4, 8, 90, 3, 'https://www.youtube.com/watch?v=j3Igk5nyZE4'),
    (wp5, 'tuesday', 'Seated Cable Row', 'Close grip', 3, 10, 60, 4, 'https://www.youtube.com/watch?v=GZbfZ033f74'),
    (wp5, 'tuesday', 'Barbell Curl', 'Strict form', 4, 8, 60, 5, 'https://www.youtube.com/watch?v=kwG2ipFRgfo'),
    (wp5, 'tuesday', 'Hammer Curls', 'Brachialis focus', 3, 12, 45, 6, 'https://www.youtube.com/watch?v=zC3nLlEvin4'),
    (wp5, 'friday', 'Lat Pulldown', 'Wide grip', 4, 10, 60, 1, 'https://www.youtube.com/watch?v=CAwf7n6Luuc'),
    (wp5, 'friday', 'One Arm Dumbbell Row', 'Full stretch', 3, 10, 60, 2, 'https://www.youtube.com/watch?v=pYcpY20QaE8'),
    (wp5, 'friday', 'Incline Dumbbell Curl', 'Long head stretch', 3, 10, 45, 3, 'https://www.youtube.com/watch?v=soxrZlIl35U');

    -- 6. Leg Day Annihilator
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Leg Day Annihilator', 'Complete leg development - quads, hams, glutes, calves.', 'advanced', 8, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp6;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp6, 'monday', 'Back Squat', 'ATG depth', 5, 5, 180, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp6, 'monday', 'Front Squat', 'Quad dominant', 4, 8, 120, 2, 'https://www.youtube.com/watch?v=m4ytaCJZpl0'),
    (wp6, 'monday', 'Romanian Deadlift', 'Hamstring focus', 4, 10, 90, 3, 'https://www.youtube.com/watch?v=7j-2w4-P14I'),
    (wp6, 'monday', 'Walking Lunges', 'Long steps', 3, 12, 60, 4, 'https://www.youtube.com/watch?v=L8fvypPrzzs'),
    (wp6, 'monday', 'Leg Extension', 'Quad isolation', 3, 15, 45, 5, 'https://www.youtube.com/watch?v=YyvSfVjQeL0'),
    (wp6, 'monday', 'Standing Calf Raise', 'Full ROM', 5, 15, 45, 6, 'https://www.youtube.com/watch?v=-M4-G8p8fmc'),
    (wp6, 'thursday', 'Hack Squat', 'Deep stretch', 4, 10, 90, 1, 'https://www.youtube.com/watch?v=0tn5K9NlCfo'),
    (wp6, 'thursday', 'Leg Press', 'Feet high for glutes', 4, 12, 90, 2, 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'),
    (wp6, 'thursday', 'Lying Leg Curl', 'Squeeze at top', 4, 12, 60, 3, 'https://www.youtube.com/watch?v=1Tq3QdYUuHs');

    -- 7. Shoulder Sculptor
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('3D Shoulder Sculptor', 'Build round, capped deltoids from all angles.', 'intermediate', 6, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp7;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp7, 'wednesday', 'Overhead Press', 'Standing barbell', 4, 6, 120, 1, 'https://www.youtube.com/watch?v=2yjwXTZQDDI'),
    (wp7, 'wednesday', 'Arnold Press', 'Rotation movement', 3, 10, 60, 2, 'https://www.youtube.com/watch?v=3ml7BH7mNwQ'),
    (wp7, 'wednesday', 'Lateral Raises', 'Slight lean forward', 4, 12, 45, 3, 'https://www.youtube.com/watch?v=3VcKaXpzqRo'),
    (wp7, 'wednesday', 'Face Pulls', 'High rope pulls', 4, 15, 45, 4, 'https://www.youtube.com/watch?v=rep-qVOkqgk'),
    (wp7, 'wednesday', 'Reverse Pec Deck', 'Rear delt', 3, 15, 45, 5, 'https://www.youtube.com/watch?v=5YK4bgzXDp0'),
    (wp7, 'wednesday', 'Shrugs', 'Trap builder', 4, 12, 60, 6, 'https://www.youtube.com/watch?v=cJRVVxmytaM');

    -- 8. Core Crusher
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Core Crusher Circuit', 'Intense core training for a strong, defined midsection.', 'beginner', 4, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp8;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp8, 'monday', 'Hanging Leg Raises', 'Controlled movement', 3, 12, 45, 1, 'https://www.youtube.com/watch?v=hdng3Nm1x_E'),
    (wp8, 'monday', 'Cable Crunches', 'Squeeze abs hard', 3, 15, 45, 2, 'https://www.youtube.com/watch?v=AV5PmZJIrrw'),
    (wp8, 'monday', 'Plank', 'Hold tight', 3, 60, 30, 3, 'https://www.youtube.com/watch?v=ASdvN_XEl_c'),
    (wp8, 'monday', 'Russian Twists', 'With weight', 3, 20, 45, 4, 'https://www.youtube.com/watch?v=wkD8rjkodUI'),
    (wp8, 'wednesday', 'Ab Wheel Rollout', 'Full extension', 3, 10, 60, 1, 'https://www.youtube.com/watch?v=rqiTPdK1c_I'),
    (wp8, 'wednesday', 'Dead Bug', 'Core stability', 3, 12, 45, 2, 'https://www.youtube.com/watch?v=4XLEnwUr1d8'),
    (wp8, 'wednesday', 'Side Plank', 'Each side', 3, 30, 30, 3, 'https://www.youtube.com/watch?v=K2VljzCC16g'),
    (wp8, 'friday', 'Bicycle Crunches', 'Touch elbow to knee', 3, 20, 45, 1, 'https://www.youtube.com/watch?v=9FGilxCbdz8'),
    (wp8, 'friday', 'Mountain Climbers', 'Fast pace', 3, 30, 45, 2, 'https://www.youtube.com/watch?v=nmwgirgXLYM');

    -- 9. HIIT Cardio Blast
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('HIIT Cardio Blast', 'High intensity interval training for fat loss.', 'intermediate', 4, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp9;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp9, 'monday', 'Burpees', 'Full body cardio', 4, 10, 30, 1, 'https://www.youtube.com/watch?v=dZgVxmf6jkA'),
    (wp9, 'monday', 'Jump Squats', 'Explosive power', 4, 15, 30, 2, 'https://www.youtube.com/watch?v=A-cFYWvaHr0'),
    (wp9, 'monday', 'Mountain Climbers', 'Core cardio', 4, 30, 30, 3, 'https://www.youtube.com/watch?v=nmwgirgXLYM'),
    (wp9, 'monday', 'Box Jumps', 'Plyometric', 4, 10, 45, 4, 'https://www.youtube.com/watch?v=52r_Ul5k03g'),
    (wp9, 'wednesday', 'Kettlebell Swings', 'Hip hinge power', 4, 20, 30, 1, 'https://www.youtube.com/watch?v=YSxHifyI6s8'),
    (wp9, 'wednesday', 'Battle Ropes', 'Alternating waves', 4, 30, 30, 2, 'https://www.youtube.com/watch?v=8UQOcF-cSGg'),
    (wp9, 'wednesday', 'Rowing Machine', 'Sprint intervals', 5, 30, 30, 3, 'https://www.youtube.com/watch?v=TTvlCBE6o9Q'),
    (wp9, 'friday', 'Sprints', 'Track or treadmill', 8, 20, 40, 1, 'https://www.youtube.com/watch?v=ddRi3WxMWMY');

    -- 10. Strength Foundation
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Strength Foundation 5x5', 'Classic strength building with compound lifts.', 'intermediate', 12, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp10;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp10, 'monday', 'Squat', 'Back squat, deep', 5, 5, 180, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp10, 'monday', 'Bench Press', 'Flat barbell', 5, 5, 180, 2, 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
    (wp10, 'monday', 'Barbell Row', 'Pendlay style', 5, 5, 120, 3, 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ'),
    (wp10, 'wednesday', 'Squat', 'Progressive overload', 5, 5, 180, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp10, 'wednesday', 'Overhead Press', 'Standing strict', 5, 5, 180, 2, 'https://www.youtube.com/watch?v=2yjwXTZQDDI'),
    (wp10, 'wednesday', 'Deadlift', 'Conventional', 1, 5, 180, 3, 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
    (wp10, 'friday', 'Squat', 'Add weight weekly', 5, 5, 180, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp10, 'friday', 'Bench Press', 'Progressive', 5, 5, 180, 2, 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
    (wp10, 'friday', 'Barbell Row', 'Heavy', 5, 5, 120, 3, 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ');

    -- Continue with plans 11-30...
    -- 11. Arm Specialization
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Arm Specialization', 'Dedicated arm training for bigger biceps and triceps.', 'intermediate', 6, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp11;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp11, 'tuesday', 'Close Grip Bench', 'Tricep focus', 4, 8, 90, 1, 'https://www.youtube.com/watch?v=nEF0bv2FW94'),
    (wp11, 'tuesday', 'Barbell Curl', 'Strict form', 4, 8, 60, 2, 'https://www.youtube.com/watch?v=kwG2ipFRgfo'),
    (wp11, 'tuesday', 'Skull Crushers', 'EZ bar', 3, 12, 60, 3, 'https://www.youtube.com/watch?v=d_KZxkY_0cM'),
    (wp11, 'tuesday', 'Preacher Curl', 'Peak contraction', 3, 10, 60, 4, 'https://www.youtube.com/watch?v=fIWP-FRFNU0'),
    (wp11, 'tuesday', 'Dips', 'Upright tricep focus', 3, 10, 60, 5, 'https://www.youtube.com/watch?v=2z8JmcrW-As'),
    (wp11, 'tuesday', 'Hammer Curls', 'Neutral grip', 3, 12, 45, 6, 'https://www.youtube.com/watch?v=zC3nLlEvin4');

    -- 12. Athletic Performance
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Athletic Performance', 'Sports-focused training for power and agility.', 'advanced', 8, gym_uuid, admin_uuid, true)
    RETURNING id INTO wp12;

    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp12, 'monday', 'Power Clean', 'Explosive hip drive', 5, 3, 120, 1, 'https://www.youtube.com/watch?v=GVt3pUOVlMM'),
    (wp12, 'monday', 'Box Jumps', 'Max height', 4, 5, 90, 2, 'https://www.youtube.com/watch?v=52r_Ul5k03g'),
    (wp12, 'monday', 'Front Squat', 'Athletic stance', 4, 6, 90, 3, 'https://www.youtube.com/watch?v=m4ytaCJZpl0'),
    (wp12, 'wednesday', 'Hang Clean', 'From knee', 4, 4, 90, 1, 'https://www.youtube.com/watch?v=V77hfK9Fw38'),
    (wp12, 'wednesday', 'Push Press', 'Leg drive', 4, 6, 90, 2, 'https://www.youtube.com/watch?v=iaBVSJm78ko'),
    (wp12, 'wednesday', 'Single Leg RDL', 'Balance and strength', 3, 8, 60, 3, 'https://www.youtube.com/watch?v=_Po3qn3zfCU'),
    (wp12, 'friday', 'Deadlift', 'Speed pulls', 5, 3, 90, 1, 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
    (wp12, 'friday', 'Broad Jumps', 'Distance focus', 4, 5, 60, 2, 'https://www.youtube.com/watch?v=96zJo3nlmHI');

    -- 13. Bodyweight Mastery
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Bodyweight Mastery', 'Build muscle with no equipment needed.', 'beginner', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp13;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp13, 'monday', 'Push-ups', 'Chest to floor', 4, 15, 60, 1, 'https://www.youtube.com/watch?v=IODxDxX7oi4'),
    (wp13, 'monday', 'Air Squats', 'Full depth', 4, 30, 60, 2, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp13, 'monday', 'Plank', 'Hold tight', 3, 60, 45, 3, 'https://www.youtube.com/watch?v=ASdvN_XEl_c');

    -- 14. Powerlifting Prep
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Powerlifting Prep', 'Squat, bench, deadlift competition prep.', 'advanced', 12, gym_uuid, admin_uuid, true) RETURNING id INTO wp14;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp14, 'monday', 'Low Bar Squat', 'Competition form', 5, 3, 240, 1, 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
    (wp14, 'wednesday', 'Bench Press', 'Paused reps', 5, 3, 180, 1, 'https://www.youtube.com/watch?v=rT7DgCr-3pg'),
    (wp14, 'friday', 'Deadlift', 'Heavy singles', 5, 1, 300, 1, 'https://www.youtube.com/watch?v=op9kVnSso6Q');

    -- 15. Muscle Endurance
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Muscle Endurance', 'High rep training for muscular endurance.', 'intermediate', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp15;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp15, 'tuesday', 'Goblet Squat', 'Constant tension', 3, 20, 45, 1, 'https://www.youtube.com/watch?v=MxsFDhcyFyE'),
    (wp15, 'tuesday', 'Push-ups', 'Burnout set', 3, 20, 45, 2, 'https://www.youtube.com/watch?v=IODxDxX7oi4'),
    (wp15, 'tuesday', 'Walking Lunges', 'High rep', 3, 20, 45, 3, 'https://www.youtube.com/watch?v=L8fvypPrzzs');

    -- 16. Fat Shredder
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Fat Shredder', 'Circuit training for maximum fat loss.', 'intermediate', 8, gym_uuid, admin_uuid, true) RETURNING id INTO wp16;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp16, 'thursday', 'Burpees', 'Full body cardio', 4, 15, 30, 1, 'https://www.youtube.com/watch?v=dZgVxmf6jkA'),
    (wp16, 'thursday', 'Kettlebell Swings', 'Hinge movement', 4, 20, 30, 2, 'https://www.youtube.com/watch?v=YSxHifyI6s8'),
    (wp16, 'thursday', 'Box Jumps', 'Explosive', 4, 12, 30, 3, 'https://www.youtube.com/watch?v=52r_Ul5k03g');

    -- 17. Functional Fitness
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Functional Fitness', 'Real-world strength and mobility.', 'beginner', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp17;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp17, 'monday', 'Farmer Carry', 'Heavy DB carry', 3, 60, 60, 1, 'https://www.youtube.com/watch?v=rt1l16S-iWc'),
    (wp17, 'monday', 'Turkish Get Up', 'Full body stability', 3, 5, 90, 2, 'https://www.youtube.com/watch?v=0bWRPC49-KI');

    -- 18. Hypertrophy Max
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Hypertrophy Max', 'Maximum muscle growth protocol.', 'advanced', 10, gym_uuid, admin_uuid, true) RETURNING id INTO wp18;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp18, 'wednesday', 'Incline DB Press', 'Upper chest', 4, 10, 60, 1, 'https://www.youtube.com/watch?v=8iPEnn-ltC8'),
    (wp18, 'wednesday', 'Lateral Raises', 'Side delt cap', 4, 15, 45, 2, 'https://www.youtube.com/watch?v=3VcKaXpzqRo');

    -- 19. Quick 30
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Quick 30 Workouts', '30-minute efficient full body sessions.', 'beginner', 4, gym_uuid, admin_uuid, true) RETURNING id INTO wp19;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp19, 'friday', 'Jump Squats', 'Fast paced', 3, 15, 30, 1, 'https://www.youtube.com/watch?v=A-cFYWvaHr0'),
    (wp19, 'friday', 'Renegade Rows', 'Core and back', 3, 10, 45, 2, 'https://www.youtube.com/watch?v=H74t1w682vw');

    -- 20. Olympic Lifting
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Olympic Lifting', 'Snatch and clean & jerk technique.', 'advanced', 12, gym_uuid, admin_uuid, true) RETURNING id INTO wp20;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp20, 'monday', 'Snatch', 'Full snatch', 5, 2, 180, 1, 'https://www.youtube.com/watch?v=9xQp2sldyts'),
    (wp20, 'wednesday', 'Clean and Jerk', 'Full clean', 5, 2, 180, 1, 'https://www.youtube.com/watch?v=8mRYYI-Q6rE');

    -- 21. Senior Fitness
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Senior Fitness', 'Safe, effective training for 50+.', 'beginner', 8, gym_uuid, admin_uuid, true) RETURNING id INTO wp21;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp21, 'monday', 'Chair Squats', 'Sit to stand', 2, 10, 60, 1, 'https://www.youtube.com/watch?v=FqSg8_Wf4SY');

    -- 22. CrossFit Ready
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('CrossFit Ready', 'Prepare for CrossFit-style workouts.', 'intermediate', 8, gym_uuid, admin_uuid, true) RETURNING id INTO wp22;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp22, 'tuesday', 'Thrusters', 'Squat press', 4, 15, 60, 1, 'https://www.youtube.com/watch?v=L219ltL15kk');

    -- 23. Glute Builder
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Glute Builder', 'Targeted glute and hip development.', 'intermediate', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp23;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp23, 'thursday', 'Hip Thrust', 'Barbell loaded', 4, 12, 90, 1, 'https://www.youtube.com/watch?v=LM8XHLYJoYs');

    -- 24. Posture Perfect
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Posture Perfect', 'Strengthen weak points, fix imbalances.', 'beginner', 8, gym_uuid, admin_uuid, true) RETURNING id INTO wp24;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp24, 'wednesday', 'Face Pulls', 'Rear delts', 3, 15, 60, 1, 'https://www.youtube.com/watch?v=rep-qVOkqgk');

    -- 25. Weekend Warrior
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Weekend Warrior', 'Two-day split for busy schedules.', 'beginner', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp25;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp25, 'saturday', 'Full Body Circuit', 'Compound moves', 3, 10, 60, 1, 'https://www.youtube.com/watch?v=1Sk901ZlqJs');

    -- 26. German Volume
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('German Volume', '10x10 for massive gains.', 'advanced', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp26;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp26, 'monday', 'Bench Press', '10 sets of 10', 10, 10, 90, 1, 'https://www.youtube.com/watch?v=rT7DgCr-3pg');

    -- 27. Yoga Integration
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Yoga Integration', 'Strength training with yoga recovery.', 'beginner', 8, gym_uuid, admin_uuid, true) RETURNING id INTO wp27;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp27, 'sunday', 'Downward Dog', 'Stretch', 3, 60, 30, 1, 'https://www.youtube.com/watch?v=EC7RGJ975iM');

    -- 28. Superhero Training
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Superhero Training', 'Build a movie-star physique.', 'advanced', 12, gym_uuid, admin_uuid, true) RETURNING id INTO wp28;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp28, 'monday', 'Incline Press', 'Upper chest', 5, 8, 90, 1, 'https://www.youtube.com/watch?v=8iPEnn-ltC8');

    -- 29. Morning Energizer
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Morning Energizer', 'Quick AM workouts to start your day.', 'beginner', 4, gym_uuid, admin_uuid, true) RETURNING id INTO wp29;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp29, 'monday', 'Jumping Jacks', 'Warmup', 3, 50, 30, 1, 'https://www.youtube.com/watch?v=c4DAnQ6DtF8');

    -- 30. Desk Worker Rescue
    INSERT INTO workout_plans (name, description, difficulty, duration_weeks, gym_id, created_by, is_template)
    VALUES ('Desk Worker Rescue', 'Fix damage from sitting all day.', 'beginner', 6, gym_uuid, admin_uuid, true) RETURNING id INTO wp30;
    INSERT INTO workout_exercises (workout_plan_id, day, exercise_name, description, sets, reps, rest_seconds, exercise_order, video_url) VALUES
    (wp30, 'wednesday', 'Glute Bridge', 'Activate glutes', 3, 15, 45, 1, 'https://www.youtube.com/watch?v=wPM8icPu6T8');

    -- =====================================================
    -- DIET PLANS (30 Plans)
    -- =====================================================

    -- 1. Weight Loss Standard
    INSERT INTO diet_plans (name, description, diet_preference, total_calories, gym_id, created_by, is_template)
    VALUES ('Weight Loss Standard', 'Balanced calorie deficit diet for steady fat loss.', 'custom', 1800, gym_uuid, admin_uuid, true)
    RETURNING id INTO dp1;

    INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
    (dp1, 'breakfast', 'Protein Oatmeal', 'Oats with protein powder, berries, and almonds', 400, 30, 45, 12, 1),
    (dp1, 'lunch', 'Grilled Chicken Salad', 'Mixed greens, chicken breast, olive oil dressing', 500, 40, 20, 25, 2),
    (dp1, 'snacks', 'Greek Yogurt', 'Plain yogurt with honey and walnuts', 200, 15, 15, 8, 3),
    (dp1, 'dinner', 'Salmon & Vegetables', 'Baked salmon with roasted broccoli', 700, 45, 30, 35, 4);

    -- 2. Muscle Gain High Protein
    INSERT INTO diet_plans (name, description, diet_preference, total_calories, gym_id, created_by, is_template)
    VALUES ('Muscle Gain High Protein', 'High protein surplus for lean muscle gains.', 'non_veg', 3000, gym_uuid, admin_uuid, true)
    RETURNING id INTO dp2;

    INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
    (dp2, 'breakfast', 'Egg & Oat Combo', '6 whole eggs, oatmeal with banana', 700, 45, 60, 30, 1),
    (dp2, 'lunch', 'Chicken Rice Bowl', 'Double chicken, white rice, vegetables', 800, 60, 80, 20, 2),
    (dp2, 'snacks', 'Mass Gainer Shake', 'Protein, oats, peanut butter, banana', 600, 40, 60, 20, 3),
    (dp2, 'dinner', 'Steak & Potatoes', 'Lean steak, sweet potato, asparagus', 900, 55, 70, 35, 4);

    -- 3. Vegetarian Balanced
    INSERT INTO diet_plans (name, description, diet_preference, total_calories, gym_id, created_by, is_template)
    VALUES ('Vegetarian Balanced', 'Complete vegetarian nutrition for active lifestyle.', 'veg', 2200, gym_uuid, admin_uuid, true)
    RETURNING id INTO dp3;

    INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
    (dp3, 'breakfast', 'Paneer Paratha', 'Whole wheat paratha with paneer filling', 450, 20, 45, 20, 1),
    (dp3, 'lunch', 'Dal Chawal', 'Lentils with brown rice and vegetables', 600, 25, 80, 15, 2),
    (dp3, 'snacks', 'Sprouts Chaat', 'Mixed sprouts with lemon and spices', 250, 15, 30, 8, 3),
    (dp3, 'dinner', 'Palak Paneer', 'Spinach curry with cottage cheese', 700, 30, 45, 35, 4);

    -- 4. Keto Diet
    INSERT INTO diet_plans (name, description, diet_preference, total_calories, gym_id, created_by, is_template)
    VALUES ('Keto Fat Burner', 'Very low carb, high fat ketogenic diet.', 'non_veg', 1800, gym_uuid, admin_uuid, true)
    RETURNING id INTO dp4;

    INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
    (dp4, 'breakfast', 'Keto Eggs', 'Scrambled eggs in butter with avocado', 500, 25, 5, 42, 1),
    (dp4, 'lunch', 'Bunless Burger', 'Beef patty, cheese, lettuce wrap', 450, 35, 8, 32, 2),
    (dp4, 'snacks', 'Cheese & Nuts', 'Almonds and cheddar cheese cubes', 300, 12, 6, 26, 3),
    (dp4, 'dinner', 'Grilled Ribeye', 'Fatty steak with butter and greens', 550, 40, 3, 42, 4);

    -- 5. Intermittent Fasting
    INSERT INTO diet_plans (name, description, diet_preference, total_calories, gym_id, created_by, is_template)
    VALUES ('16:8 Intermittent Fasting', 'Eating window 12pm-8pm only.', 'custom', 2000, gym_uuid, admin_uuid, true)
    RETURNING id INTO dp5;

    INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
    (dp5, 'lunch', 'Big First Meal', 'Chicken, rice, vegetables, healthy fats', 800, 50, 70, 30, 1),
    (dp5, 'snacks', 'Protein Snack', 'Greek yogurt or protein shake', 300, 30, 15, 10, 2),
    (dp5, 'dinner', 'Complete Dinner', 'Fish, quinoa, salad with olive oil', 900, 45, 65, 40, 3);

    -- 6-30: More diet plans
    INSERT INTO diet_plans (name, description, diet_preference, total_calories, gym_id, created_by, is_template) VALUES
    ('High Carb Athlete', 'Carb-focused for endurance athletes.', 'custom', 3200, gym_uuid, admin_uuid, true),
    ('Clean Eating Basics', 'No processed foods, whole foods only.', 'custom', 2200, gym_uuid, admin_uuid, true),
    ('Paleo Primitive', 'Eat like our ancestors.', 'non_veg', 2400, gym_uuid, admin_uuid, true),
    ('Mediterranean Heart', 'Heart-healthy Mediterranean style.', 'custom', 2000, gym_uuid, admin_uuid, true),
    ('Vegan Power', 'Plant-based high protein.', 'veg', 2400, gym_uuid, admin_uuid, true),
    ('Competition Prep', 'Strict cutting diet for shows.', 'non_veg', 1500, gym_uuid, admin_uuid, true),
    ('Maintenance Easy', 'Simple maintenance calories.', 'custom', 2200, gym_uuid, admin_uuid, true),
    ('Bulk Season', 'Aggressive calorie surplus.', 'non_veg', 3500, gym_uuid, admin_uuid, true),
    ('Indian Vegetarian', 'Traditional Indian veg diet.', 'veg', 2000, gym_uuid, admin_uuid, true),
    ('Low Fat Heart', 'Reduced fat for heart health.', 'custom', 1800, gym_uuid, admin_uuid, true),
    ('High Fiber Digestion', 'Fiber-rich for gut health.', 'veg', 2000, gym_uuid, admin_uuid, true),
    ('Anti-Inflammatory', 'Reduce inflammation naturally.', 'custom', 2000, gym_uuid, admin_uuid, true),
    ('Budget Muscle', 'Build muscle on a budget.', 'custom', 2800, gym_uuid, admin_uuid, true),
    ('Quick Prep Meals', 'Fast meals for busy people.', 'custom', 2200, gym_uuid, admin_uuid, true),
    ('Diabetic Friendly', 'Low glycemic index meals.', 'custom', 1800, gym_uuid, admin_uuid, true),
    ('PCOS Management', 'Hormone balancing diet.', 'custom', 1600, gym_uuid, admin_uuid, true),
    ('Post-Workout Focus', 'Optimized for recovery.', 'custom', 2400, gym_uuid, admin_uuid, true),
    ('Pre-Contest Peak', 'Final week water manipulation.', 'non_veg', 1400, gym_uuid, admin_uuid, true),
    ('South Indian Fit', 'Healthy South Indian cuisine.', 'veg', 2000, gym_uuid, admin_uuid, true),
    ('Egg-Based Protein', 'Eggs as primary protein source.', 'non_veg', 2200, gym_uuid, admin_uuid, true),
    ('Smoothie Diet', 'Liquid nutrition focused.', 'veg', 1800, gym_uuid, admin_uuid, true),
    ('Carb Cycling', 'High/low carb rotation.', 'custom', 2200, gym_uuid, admin_uuid, true),
    ('Protein Sparing', 'Maximum protein, minimal calories.', 'non_veg', 1400, gym_uuid, admin_uuid, true),
    ('Pescatarian Plan', 'Fish and vegetarian.', 'non_veg', 2200, gym_uuid, admin_uuid, true),
    ('Whole30 Style', '30 days whole foods reset.', 'custom', 2000, gym_uuid, admin_uuid, true);

    RAISE NOTICE 'Successfully created 30 workout plans and 30 diet plans!';
END $$;

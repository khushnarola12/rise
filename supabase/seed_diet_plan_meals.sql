-- =====================================================
-- ADD MEALS TO ALL DIET PLANS (Plans 6-30)
-- Plans 1-5 already have meals. This adds meals to the rest.
-- Run this AFTER seed_workout_diet_plans.sql
-- =====================================================

DO $$
DECLARE
    gym_uuid UUID;
    plan_record RECORD;
BEGIN
    SELECT id INTO gym_uuid FROM gyms LIMIT 1;

    IF gym_uuid IS NULL THEN
        RAISE EXCEPTION 'No gym found. Please create a gym first.';
    END IF;

    -- High Carb Athlete (dp6)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'High Carb Athlete' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Banana Pancakes', 'Whole wheat pancakes with banana, maple syrup, and eggs', 650, 25, 95, 15, 1),
        (plan_record.id, 'snacks', 'Energy Granola Bar', 'Homemade oat bar with dried fruits and honey', 350, 8, 55, 12, 2),
        (plan_record.id, 'lunch', 'Pasta Primavera', 'Whole grain pasta with grilled chicken and mixed vegetables', 850, 40, 110, 20, 3),
        (plan_record.id, 'snacks', 'Fruit & Rice Cake', 'Rice cakes with almond butter and sliced apple', 300, 8, 45, 10, 4),
        (plan_record.id, 'dinner', 'Chicken Stir Fry Rice', 'Basmati rice with chicken, bell peppers, and teriyaki', 1050, 45, 130, 25, 5);
    END LOOP;

    -- Clean Eating Basics (dp7)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Clean Eating Basics' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Overnight Oats', 'Oats soaked with chia seeds, almond milk, and fresh berries', 400, 15, 55, 14, 1),
        (plan_record.id, 'lunch', 'Turkey Avocado Wrap', 'Whole wheat wrap with turkey, avocado, spinach', 550, 35, 40, 22, 2),
        (plan_record.id, 'snacks', 'Veggie Sticks & Hummus', 'Carrots, cucumber, celery with chickpea hummus', 250, 8, 25, 14, 3),
        (plan_record.id, 'dinner', 'Baked Cod & Quinoa', 'Herb-crusted cod fillet with quinoa and roasted veggies', 600, 40, 50, 18, 4);
    END LOOP;

    -- Paleo Primitive (dp8)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Paleo Primitive' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Sweet Potato Hash', 'Sweet potato, eggs, bacon, and avocado hash', 550, 30, 40, 30, 1),
        (plan_record.id, 'lunch', 'Grilled Chicken Salad', 'Big salad with grilled chicken, nuts, olive oil', 650, 45, 20, 40, 2),
        (plan_record.id, 'snacks', 'Mixed Nuts & Berries', 'Raw almonds, walnuts, and fresh berries', 300, 8, 15, 24, 3),
        (plan_record.id, 'dinner', 'Grass-Fed Steak Plate', 'Steak with roasted root vegetables and ghee', 900, 50, 35, 55, 4);
    END LOOP;

    -- Mediterranean Heart (dp9)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Mediterranean Heart' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Greek Yogurt Bowl', 'Full-fat Greek yogurt with honey, walnuts, and figs', 400, 20, 40, 18, 1),
        (plan_record.id, 'lunch', 'Falafel Plate', 'Baked falafel with tabbouleh, hummus, and pita', 600, 22, 65, 28, 2),
        (plan_record.id, 'snacks', 'Olives & Feta', 'Kalamata olives with feta cheese and cherry tomatoes', 250, 8, 8, 22, 3),
        (plan_record.id, 'dinner', 'Grilled Sea Bass', 'Whole sea bass with lemon, herbs, and olive oil potatoes', 750, 40, 45, 35, 4);
    END LOOP;

    -- Vegan Power (dp10)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Vegan Power' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Tofu Scramble', 'Firm tofu crumble with veggies, nutritional yeast, and toast', 500, 30, 45, 20, 1),
        (plan_record.id, 'lunch', 'Lentil Buddha Bowl', 'Red lentils, roasted sweet potato, tahini dressing', 650, 28, 80, 22, 2),
        (plan_record.id, 'snacks', 'Protein Smoothie', 'Pea protein, banana, spinach, almond butter', 350, 25, 40, 12, 3),
        (plan_record.id, 'dinner', 'Chickpea Curry & Rice', 'Coconut chickpea curry with basmati rice', 900, 30, 110, 35, 4);
    END LOOP;

    -- Competition Prep (dp11)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Competition Prep' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Egg White Omelette', '8 egg whites with spinach and mushrooms', 250, 40, 5, 3, 1),
        (plan_record.id, 'lunch', 'Tilapia & Asparagus', 'Baked tilapia with steamed asparagus', 350, 45, 10, 12, 2),
        (plan_record.id, 'snacks', 'Protein Shake', 'Whey isolate with water', 150, 30, 3, 1, 3),
        (plan_record.id, 'dinner', 'Chicken Breast & Broccoli', 'Plain grilled chicken with steamed broccoli', 400, 50, 15, 10, 4),
        (plan_record.id, 'snacks', 'Casein Shake', 'Slow-release protein before bed', 150, 28, 5, 2, 5);
    END LOOP;

    -- Maintenance Easy (dp12)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Maintenance Easy' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Avocado Toast & Eggs', 'Sourdough toast with avocado and 2 poached eggs', 450, 22, 35, 25, 1),
        (plan_record.id, 'lunch', 'Chicken Burrito Bowl', 'Chicken, rice, black beans, salsa, sour cream', 650, 40, 65, 22, 2),
        (plan_record.id, 'snacks', 'Trail Mix', 'Almonds, cashews, dark chocolate chips, raisins', 300, 8, 30, 18, 3),
        (plan_record.id, 'dinner', 'Salmon Teriyaki', 'Glazed salmon with jasmine rice and bok choy', 800, 42, 70, 30, 4);
    END LOOP;

    -- Bulk Season (dp13)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Bulk Season' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Mass Builder Breakfast', '4 whole eggs, 4 toast, avocado, orange juice', 900, 40, 80, 45, 1),
        (plan_record.id, 'snacks', 'Weight Gainer Shake', 'Whey, oats, banana, peanut butter, whole milk', 700, 45, 75, 25, 2),
        (plan_record.id, 'lunch', 'Double Chicken & Rice', '300g chicken thigh with 2 cups rice and veggies', 950, 60, 100, 28, 3),
        (plan_record.id, 'snacks', 'PB & Jelly Sandwich', 'Whole wheat bread, natural peanut butter, jam', 450, 15, 50, 22, 4),
        (plan_record.id, 'dinner', 'Beef Pasta Bowl', 'Ground beef with whole grain pasta and marinara', 1000, 50, 95, 40, 5);
    END LOOP;

    -- Indian Vegetarian (dp14)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Indian Vegetarian' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Poha with Jaggery Milk', 'Flattened rice with peanuts, turmeric, and warm milk', 400, 12, 60, 14, 1),
        (plan_record.id, 'lunch', 'Rajma Chawal', 'Kidney bean curry with steamed rice and raita', 600, 22, 85, 15, 2),
        (plan_record.id, 'snacks', 'Chana Chaat', 'Boiled chickpeas with onion, tomato, lemon', 250, 12, 35, 6, 3),
        (plan_record.id, 'dinner', 'Mixed Veg Roti', 'Seasonal vegetables curry with 3 whole wheat rotis', 550, 15, 65, 20, 4);
    END LOOP;

    -- Low Fat Heart (dp15)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Low Fat Heart' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Oat Bran Porridge', 'Oat bran with skimmed milk, cinnamon, and apple', 350, 15, 55, 6, 1),
        (plan_record.id, 'lunch', 'Turkey Breast Sandwich', 'Whole grain bread with lean turkey, mustard, veggies', 450, 35, 50, 8, 2),
        (plan_record.id, 'snacks', 'Fat-Free Yogurt', 'Plain yogurt with mixed berries', 150, 12, 22, 1, 3),
        (plan_record.id, 'dinner', 'Grilled Chicken & Salad', 'Skinless chicken breast with large garden salad', 500, 45, 30, 12, 4);
    END LOOP;

    -- High Fiber Digestion (dp16)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'High Fiber Digestion' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Bran Flakes & Fruit', 'High-fiber cereal with banana and flax seeds', 380, 10, 65, 8, 1),
        (plan_record.id, 'lunch', 'Black Bean Soup', 'Hearty black bean soup with whole grain bread', 550, 25, 75, 12, 2),
        (plan_record.id, 'snacks', 'Apple & Almonds', 'Whole apple with a handful of raw almonds', 250, 6, 28, 14, 3),
        (plan_record.id, 'dinner', 'Lentil Stew & Brown Rice', 'Mixed lentil stew with brown rice and steamed kale', 600, 28, 80, 12, 4);
    END LOOP;

    -- Anti-Inflammatory (dp17)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Anti-Inflammatory' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Turmeric Smoothie Bowl', 'Mango, turmeric, ginger, chia seeds, coconut flakes', 400, 10, 55, 18, 1),
        (plan_record.id, 'lunch', 'Wild Salmon Salad', 'Wild salmon on bed of dark greens with berries', 600, 38, 25, 35, 2),
        (plan_record.id, 'snacks', 'Walnuts & Dark Chocolate', 'Raw walnuts with 85% dark chocolate square', 300, 6, 15, 25, 3),
        (plan_record.id, 'dinner', 'Bone Broth Veggie Bowl', 'Warm bone broth with roasted root vegetables', 500, 25, 50, 18, 4);
    END LOOP;

    -- Budget Muscle (dp18)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Budget Muscle' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Egg & Oat Stack', '4 whole eggs with big bowl of oatmeal and banana', 600, 32, 70, 22, 1),
        (plan_record.id, 'lunch', 'Chicken Thigh & Rice', 'Bulk chicken thighs with white rice and frozen veggies', 750, 45, 80, 22, 2),
        (plan_record.id, 'snacks', 'PB Banana Sandwich', 'Peanut butter and banana on whole wheat', 400, 14, 50, 18, 3),
        (plan_record.id, 'dinner', 'Tuna Pasta', 'Canned tuna with whole wheat pasta and olive oil', 650, 38, 75, 18, 4);
    END LOOP;

    -- Quick Prep Meals (dp19)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Quick Prep Meals' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', '2-Min Protein Shake', 'Whey protein, oats, frozen berries in blender', 400, 35, 45, 8, 1),
        (plan_record.id, 'lunch', 'Microwave Chicken Bowl', 'Pre-cooked chicken with microwaved rice and veggies', 600, 40, 60, 18, 2),
        (plan_record.id, 'snacks', 'Protein Bar & Banana', 'Store-bought protein bar with a banana', 350, 25, 40, 10, 3),
        (plan_record.id, 'dinner', 'Sheet Pan Dinner', 'Sausage, potatoes, peppers - one pan 20 min', 650, 30, 55, 30, 4);
    END LOOP;

    -- Diabetic Friendly (dp20)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Diabetic Friendly' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Veggie Omelette', '3 egg omelette with spinach, tomato, and cheese', 350, 25, 8, 24, 1),
        (plan_record.id, 'lunch', 'Grilled Chicken Wrap', 'Low-carb wrap with chicken, lettuce, light mayo', 450, 38, 22, 20, 2),
        (plan_record.id, 'snacks', 'Cottage Cheese & Nuts', 'Low-fat cottage cheese with walnuts', 200, 18, 6, 12, 3),
        (plan_record.id, 'dinner', 'Fish & Green Beans', 'Baked white fish with sauteed green beans', 500, 40, 18, 28, 4);
    END LOOP;

    -- PCOS Management (dp21)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'PCOS Management' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Cinnamon Chia Pudding', 'Chia seeds with almond milk, cinnamon, and walnuts', 300, 10, 25, 18, 1),
        (plan_record.id, 'lunch', 'Salmon Quinoa Bowl', 'Grilled salmon with quinoa and leafy greens', 500, 35, 40, 22, 2),
        (plan_record.id, 'snacks', 'Spearmint Tea & Seeds', 'Spearmint tea with pumpkin seeds', 150, 6, 8, 10, 3),
        (plan_record.id, 'dinner', 'Turkey Lettuce Cups', 'Ground turkey in lettuce wraps with avocado', 450, 35, 12, 28, 4);
    END LOOP;

    -- Post-Workout Focus (dp22)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Post-Workout Focus' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Pre-Workout Oats', 'Oatmeal with honey and banana 1hr before training', 450, 15, 75, 10, 1),
        (plan_record.id, 'snacks', 'Post-Workout Shake', 'Whey protein, dextrose, creatine immediately after', 400, 40, 50, 3, 2),
        (plan_record.id, 'lunch', 'Recovery Meal', 'Chicken, white rice, sweet potato - fast digesting', 700, 45, 90, 15, 3),
        (plan_record.id, 'dinner', 'Lean Steak & Potato', 'Sirloin steak with baked potato and greens', 650, 45, 55, 22, 4);
    END LOOP;

    -- Pre-Contest Peak (dp23)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Pre-Contest Peak' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Egg Whites & Rice Cake', '10 egg whites with 2 plain rice cakes', 280, 35, 25, 2, 1),
        (plan_record.id, 'lunch', 'Tilapia & Sweet Potato', 'Dry-cooked tilapia with measured sweet potato', 380, 40, 35, 5, 2),
        (plan_record.id, 'snacks', 'Whey Isolate', 'Pure whey isolate in water only', 120, 28, 1, 0, 3),
        (plan_record.id, 'dinner', 'White Fish & Greens', 'Steamed white fish with cucumber and lettuce', 320, 42, 8, 8, 4);
    END LOOP;

    -- South Indian Fit (dp24)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'South Indian Fit' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Idli Sambar', '4 steamed idlis with sambar and chutney', 400, 12, 65, 8, 1),
        (plan_record.id, 'lunch', 'Rice with Sambhar & Poriyal', 'Medium rice, thick sambhar, dry veggie side', 600, 18, 90, 14, 2),
        (plan_record.id, 'snacks', 'Sundal', 'Boiled black chickpeas with coconut and curry leaves', 250, 12, 30, 8, 3),
        (plan_record.id, 'dinner', 'Dosa & Chutney', '2 masala dosa with coconut chutney', 550, 14, 70, 22, 4);
    END LOOP;

    -- Egg-Based Protein (dp25)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Egg-Based Protein' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Egg Bhurji & Toast', '4 eggs scrambled with onion, tomato, green chili', 500, 28, 35, 28, 1),
        (plan_record.id, 'lunch', 'Egg Curry & Rice', '3 boiled eggs in curry sauce with steamed rice', 650, 30, 75, 24, 2),
        (plan_record.id, 'snacks', 'Boiled Eggs', '3 whole boiled eggs with salt and pepper', 250, 18, 2, 18, 3),
        (plan_record.id, 'dinner', 'Egg Fried Rice', 'Fried rice with 3 eggs, vegetables, soy sauce', 600, 25, 70, 22, 4);
    END LOOP;

    -- Smoothie Diet (dp26)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Smoothie Diet' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Green Power Smoothie', 'Spinach, banana, protein powder, almond milk, flaxseed', 400, 30, 50, 10, 1),
        (plan_record.id, 'snacks', 'Berry Blast Shake', 'Mixed berries, Greek yogurt, honey', 300, 15, 45, 6, 2),
        (plan_record.id, 'lunch', 'Tropical Protein Bowl', 'Mango, pineapple, coconut milk, pea protein, topped with granola', 550, 28, 70, 18, 3),
        (plan_record.id, 'dinner', 'Savory Veggie Soup', 'Blended vegetable soup with grilled paneer on side', 450, 22, 40, 22, 4);
    END LOOP;

    -- Carb Cycling (dp27)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Carb Cycling' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'High Carb: Oat Bowl', 'Training day: oats, banana, honey, protein powder', 500, 30, 75, 10, 1),
        (plan_record.id, 'lunch', 'Moderate: Chicken Wrap', 'Whole wheat wrap with chicken and vegetables', 550, 40, 45, 20, 2),
        (plan_record.id, 'snacks', 'Low Carb: Cheese & Nuts', 'Rest day snack: almonds and cheese cubes', 300, 12, 8, 25, 3),
        (plan_record.id, 'dinner', 'Flexible: Salmon Bowl', 'Salmon with rice (high day) or salad (low day)', 650, 40, 50, 28, 4);
    END LOOP;

    -- Protein Sparing (dp28)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Protein Sparing' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Egg White Veggie Bowl', '8 egg whites with peppers and mushrooms', 220, 38, 8, 2, 1),
        (plan_record.id, 'lunch', 'Chicken & Cucumber', 'Grilled chicken breast with cucumber salad', 350, 50, 10, 10, 2),
        (plan_record.id, 'snacks', 'Fat-Free Cottage Cheese', 'Plain cottage cheese with dill', 130, 25, 5, 0, 3),
        (plan_record.id, 'dinner', 'Shrimp Stir-Fry', 'Shrimp with bok choy and minimal oil', 400, 45, 15, 15, 4);
    END LOOP;

    -- Pescatarian Plan (dp29)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Pescatarian Plan' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Smoked Salmon Toast', 'Whole grain toast with cream cheese and smoked salmon', 450, 25, 35, 22, 1),
        (plan_record.id, 'lunch', 'Tuna Poke Bowl', 'Fresh tuna, edamame, avocado, rice, soy sauce', 600, 38, 55, 22, 2),
        (plan_record.id, 'snacks', 'Seaweed & Edamame', 'Roasted seaweed sheets with steamed edamame', 200, 12, 15, 8, 3),
        (plan_record.id, 'dinner', 'Grilled Prawns & Veggies', 'Jumbo prawns with grilled zucchini and quinoa', 650, 40, 50, 22, 4);
    END LOOP;

    -- Whole30 Style (dp30)
    FOR plan_record IN SELECT id FROM diet_plans WHERE name = 'Whole30 Style' AND gym_id = gym_uuid AND is_template = true LIMIT 1 LOOP
        DELETE FROM diet_plan_meals WHERE diet_plan_id = plan_record.id;
        INSERT INTO diet_plan_meals (diet_plan_id, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g, meal_order) VALUES
        (plan_record.id, 'breakfast', 'Veggie Frittata', 'Eggs with sweet potato, kale, and mushrooms', 450, 25, 30, 25, 1),
        (plan_record.id, 'lunch', 'Chicken Avocado Bowl', 'Grilled chicken, avocado, tomato, lime dressing', 600, 40, 25, 35, 2),
        (plan_record.id, 'snacks', 'Apple & Almond Butter', 'Sliced apple with compliant almond butter', 250, 6, 30, 14, 3),
        (plan_record.id, 'dinner', 'Herb Roasted Pork', 'Pork tenderloin with roasted root vegetables', 500, 40, 35, 20, 4);
    END LOOP;

    RAISE NOTICE 'Successfully added meals to all 25 remaining diet plans!';
END $$;

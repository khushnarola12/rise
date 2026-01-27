'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface Meal {
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  meal_name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

interface CreateDietPlanData {
  name: string;
  description: string;
  diet_preference: string;
  gymId: string;
  createdBy: string;
  meals: Meal[];
}

export async function createDietPlan(data: CreateDietPlanData) {
  try {
    // Calculate total calories
    const totalCalories = data.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

    // Create diet plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('diet_plans')
      .insert({
        name: data.name,
        description: data.description,
        diet_preference: data.diet_preference,
        total_calories: totalCalories,
        gym_id: data.gymId,
        created_by: data.createdBy,
        is_template: true,
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating diet plan:', planError);
      throw new Error(planError.message || 'Failed to create diet plan');
    }

    // Create meals
    if (data.meals.length > 0) {
      const mealsData = data.meals.map((meal, index) => ({
        diet_plan_id: plan.id,
        meal_type: meal.meal_type,
        meal_name: meal.meal_name,
        description: meal.description,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fats_g: meal.fats_g,
        meal_order: index + 1,
      }));

      const { error: mealsError } = await supabaseAdmin
        .from('diet_plan_meals')
        .insert(mealsData);

      if (mealsError) {
        console.error('Error creating meals:', mealsError);
        throw new Error(mealsError.message || 'Failed to create meals');
      }
    }

    revalidatePath('/admin/diets');
    return { success: true, planId: plan.id };
  } catch (error) {
    console.error('Error in createDietPlan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

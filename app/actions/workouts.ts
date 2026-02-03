'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface Exercise {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  exercise_name: string;
  description: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  video_url: string;
}

interface CreateWorkoutPlanData {
  name: string;
  description: string;
  difficulty: string;
  duration_weeks: number;
  gymId: string;
  createdBy: string;
  exercises: Exercise[];
}

export async function createWorkoutPlan(data: CreateWorkoutPlanData) {
  try {
    // Create workout plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('workout_plans')
      .insert({
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        duration_weeks: data.duration_weeks,
        gym_id: data.gymId,
        created_by: data.createdBy,
        is_template: true,
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating workout plan:', planError);
      throw new Error(planError.message || 'Failed to create workout plan');
    }

    // Create exercises
    if (data.exercises.length > 0) {
      const exercisesData = data.exercises.map((exercise, index) => ({
        workout_plan_id: plan.id,
        day: exercise.day,
        exercise_name: exercise.exercise_name,
        description: exercise.description,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_seconds: exercise.rest_seconds,
        video_url: exercise.video_url || null,
        exercise_order: index + 1,
      }));

      const { error: exercisesError } = await supabaseAdmin
        .from('workout_exercises')
        .insert(exercisesData);

      if (exercisesError) {
        console.error('Error creating exercises:', exercisesError);
        throw new Error(exercisesError.message || 'Failed to create exercises');
      }
    }

    revalidatePath('/admin/workouts');
    revalidatePath('/trainer/workouts');
    revalidatePath('/user/workout');
    revalidatePath('/user/dashboard');
    return { success: true, planId: plan.id };
  } catch (error) {
    console.error('Error in createWorkoutPlan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function updateWorkoutPlan(planId: string, data: Partial<CreateWorkoutPlanData>) {
  try {
    const { error: planError } = await supabaseAdmin
      .from('workout_plans')
      .update({
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        duration_weeks: data.duration_weeks,
      })
      .eq('id', planId);

    if (planError) {
      console.error('Error updating workout plan:', planError);
      throw new Error(planError.message || 'Failed to update workout plan');
    }

    // If exercises are provided, delete old ones and create new ones
    if (data.exercises && data.exercises.length > 0) {
      // Delete existing exercises
      await supabaseAdmin
        .from('workout_exercises')
        .delete()
        .eq('workout_plan_id', planId);

      // Insert new exercises
      const exercisesData = data.exercises.map((exercise, index) => ({
        workout_plan_id: planId,
        day: exercise.day,
        exercise_name: exercise.exercise_name,
        description: exercise.description,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_seconds: exercise.rest_seconds,
        video_url: exercise.video_url || null,
        exercise_order: index + 1,
      }));

      const { error: exercisesError } = await supabaseAdmin
        .from('workout_exercises')
        .insert(exercisesData);

      if (exercisesError) {
        console.error('Error updating exercises:', exercisesError);
        throw new Error(exercisesError.message || 'Failed to update exercises');
      }
    }

    revalidatePath('/admin/workouts');
    revalidatePath('/trainer/workouts');
    revalidatePath('/user/workout');
    return { success: true };
  } catch (error) {
    console.error('Error in updateWorkoutPlan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function deleteWorkoutPlan(planId: string) {
  try {
    // First delete associated exercises
    await supabaseAdmin
      .from('workout_exercises')
      .delete()
      .eq('workout_plan_id', planId);

    // Delete any user assignments
    await supabaseAdmin
      .from('user_workout_plans')
      .delete()
      .eq('workout_plan_id', planId);

    // Delete the plan
    const { error } = await supabaseAdmin
      .from('workout_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting workout plan:', error);
      throw new Error(error.message || 'Failed to delete workout plan');
    }

    revalidatePath('/admin/workouts');
    revalidatePath('/trainer/workouts');
    revalidatePath('/user/workout');
    revalidatePath('/user/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteWorkoutPlan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function getWorkoutPlan(planId: string) {
  const { data, error } = await supabaseAdmin
    .from('workout_plans')
    .select('*, workout_exercises(*)')
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Error fetching workout plan:', error);
    return null;
  }

  return data;
}

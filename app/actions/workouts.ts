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
    return { success: true, planId: plan.id };
  } catch (error) {
    console.error('Error in createWorkoutPlan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

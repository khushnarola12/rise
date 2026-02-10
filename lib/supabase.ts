import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (database only - NOT used for auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-application-name': 'rise-fitness',
    },
  },
  db: {
    schema: 'public',
  },
});

// Database types
export type UserRole = 'superuser' | 'admin' | 'trainer' | 'user';
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
export type DietPreference = 'veg' | 'non_veg' | 'custom';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface User {
  id: string;
  auth_id: string | null;
  clerk_id?: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: UserRole;
  gym_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: string | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  bmi: number | null;
  fitness_goal: string | null;
  medical_conditions: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  gym_id: string | null;
  diet_preference: DietPreference;
  total_calories: number | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface DietPlanMeal {
  id: string;
  diet_plan_id: string;
  meal_type: MealType;
  meal_name: string;
  description: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  meal_order: number;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  gym_id: string | null;
  difficulty: DifficultyLevel;
  duration_weeks: number | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_plan_id: string;
  day: DayOfWeek;
  exercise_name: string;
  description: string | null;
  sets: number | null;
  reps: number | null;
  rest_seconds: number | null;
  exercise_order: number;
  video_url: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  gym_id: string;
  check_in_time: string;
  check_out_time: string | null;
  marked_by: string | null;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface ProgressLog {
  id: string;
  user_id: string;
  weight_kg: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  notes: string | null;
  logged_at: string;
  logged_by: string | null;
}

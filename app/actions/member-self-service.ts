'use server';

import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

// ============================================
// MEMBER SELF-SERVICE ACTIONS
// ============================================

/**
 * Allow member to check themselves in
 */
export async function selfCheckIn() {
  const user = await getCurrentUserData();
  
  if (!user || user.role !== 'user') {
    return { success: false, error: 'Unauthorized' };
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Check if already checked in today
  const { data: existing } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing?.check_in_time && !existing?.check_out_time) {
    return { success: false, error: 'Already checked in. Please check out first.' };
  }

  if (existing?.check_out_time) {
    return { success: false, error: 'Already completed today\'s session.' };
  }

  const { error } = await supabaseAdmin
    .from('attendance')
    .insert({
      user_id: user.id,
      gym_id: user.gym_id,
      date: today,
      check_in_time: new Date().toISOString(),
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/user/dashboard');
  revalidatePath('/user/attendance');
  return { success: true, message: 'Checked in successfully! Have a great workout! 💪' };
}

/**
 * Allow member to check themselves out
 */
export async function selfCheckOut() {
  const user = await getCurrentUserData();
  
  if (!user || user.role !== 'user') {
    return { success: false, error: 'Unauthorized' };
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Find today's attendance
  const { data: existing } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (!existing) {
    return { success: false, error: 'Not checked in today' };
  }

  if (existing.check_out_time) {
    return { success: false, error: 'Already checked out' };
  }

  const { error } = await supabaseAdmin
    .from('attendance')
    .update({ check_out_time: new Date().toISOString() })
    .eq('id', existing.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/user/dashboard');
  revalidatePath('/user/attendance');
  return { success: true, message: 'Checked out! Great session! 🎉' };
}

/**
 * Allow member to log their own progress
 */
export async function logOwnProgress(data: {
  weight_kg: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  notes?: string;
}) {
  const user = await getCurrentUserData();
  
  if (!user || user.role !== 'user') {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch profile for height (needed for BMI)
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('height_cm')
    .eq('user_id', user.id)
    .single();

  // Calculate BMI if height is available
  let bmi: number | null = null;
  if (profile?.height_cm && data.weight_kg) {
    const heightM = profile.height_cm / 100;
    bmi = Math.round((data.weight_kg / (heightM * heightM)) * 10) / 10;
  }

  const { error } = await supabaseAdmin
    .from('progress_logs')
    .insert({
      user_id: user.id,
      weight_kg: data.weight_kg,
      bmi,
      body_fat_percentage: data.body_fat_percentage,
      muscle_mass_kg: data.muscle_mass_kg,
      notes: data.notes,
      logged_at: new Date().toISOString(),
      logged_by: user.id,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // Update profile current weight
  await supabaseAdmin
    .from('user_profiles')
    .update({ 
      current_weight_kg: data.weight_kg,
      bmi 
    })
    .eq('user_id', user.id);

  revalidatePath('/user/dashboard');
  revalidatePath('/user/progress');
  return { success: true, message: 'Progress logged successfully!' };
}

/**
 * Allow member to update their own profile
 */
export async function updateOwnProfile(data: {
  height_cm?: number;
  target_weight_kg?: number;
  fitness_goal?: string;
  experience_level?: string;
  health_conditions?: string;
  phone?: string;
}) {
  const user = await getCurrentUserData();
  
  if (!user || user.role !== 'user') {
    return { success: false, error: 'Unauthorized' };
  }

  // Update user phone if provided
  if (data.phone !== undefined) {
    await supabaseAdmin
      .from('users')
      .update({ phone: data.phone })
      .eq('id', user.id);
  }

  // Update profile
  const { data: existingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const profileUpdate: any = {};
  if (data.height_cm) profileUpdate.height_cm = data.height_cm;
  if (data.target_weight_kg) profileUpdate.target_weight_kg = data.target_weight_kg;
  if (data.fitness_goal) profileUpdate.fitness_goal = data.fitness_goal;
  if (data.experience_level) profileUpdate.experience_level = data.experience_level;
  if (data.health_conditions !== undefined) profileUpdate.health_conditions = data.health_conditions;

  if (Object.keys(profileUpdate).length > 0) {
    if (existingProfile) {
      await supabaseAdmin
        .from('user_profiles')
        .update(profileUpdate)
        .eq('user_id', user.id);
    } else {
      await supabaseAdmin
        .from('user_profiles')
        .insert({ user_id: user.id, ...profileUpdate });
    }
  }

  revalidatePath('/user/profile');
  revalidatePath('/user/dashboard');
  return { success: true, message: 'Profile updated successfully!' };
}

/**
 * Get today's check-in status for member
 */
export async function getTodayCheckInStatus() {
  const user = await getCurrentUserData();
  
  if (!user) {
    return { checkedIn: false, checkedOut: false };
  }

  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabaseAdmin
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  return {
    checkedIn: !!data?.check_in_time,
    checkedOut: !!data?.check_out_time,
    checkInTime: data?.check_in_time,
    checkOutTime: data?.check_out_time,
  };
}

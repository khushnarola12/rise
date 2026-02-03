'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { getCurrentUserData } from '@/lib/auth';

// ==========================================
// TRAINER ASSIGNMENT ACTIONS
// ==========================================

export async function assignTrainerToMember(trainerId: string, memberId: string) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized: Only admins can assign trainers' };
  }

  try {
    // First, deactivate ALL existing trainer assignments for this member (enforce 1:1)
    await supabaseAdmin
      .from('trainer_assignments')
      .update({ is_active: false })
      .eq('user_id', memberId)
      .eq('is_active', true);

    // Check if this specific trainer-member assignment already exists
    const { data: existing } = await supabaseAdmin
      .from('trainer_assignments')
      .select('id')
      .eq('trainer_id', trainerId)
      .eq('user_id', memberId)
      .single();

    if (existing) {
      // Reactivate existing assignment
      await supabaseAdmin
        .from('trainer_assignments')
        .update({ is_active: true, assigned_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // Create new assignment
      const { error } = await supabaseAdmin
        .from('trainer_assignments')
        .insert({
          trainer_id: trainerId,
          user_id: memberId,
          assigned_by: currentUser.id,
          is_active: true,
        });

      if (error) throw error;
    }

    revalidatePath('/admin/members');
    revalidatePath('/admin/members/[id]', 'page');
    revalidatePath('/admin/trainers');
    revalidatePath('/trainer/members');
    
    return { success: true, message: 'Trainer assigned successfully' };
  } catch (error) {
    console.error('Error assigning trainer:', error);
    return { success: false, error: 'Failed to assign trainer' };
  }
}

export async function unassignTrainerFromMember(trainerId: string, memberId: string) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('trainer_assignments')
      .update({ is_active: false })
      .eq('trainer_id', trainerId)
      .eq('user_id', memberId);

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidatePath('/admin/trainers');
    revalidatePath('/trainer/members');
    
    return { success: true, message: 'Trainer unassigned successfully' };
  } catch (error) {
    console.error('Error unassigning trainer:', error);
    return { success: false, error: 'Failed to unassign trainer' };
  }
}

// ==========================================
// WORKOUT PLAN ASSIGNMENT ACTIONS
// ==========================================

export async function assignWorkoutPlanToMember(
  planId: string, 
  memberId: string,
  durationWeeks?: number
) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  // If trainer, verify they are assigned to this member
  if (currentUser.role === 'trainer') {
    const { data: assignment } = await supabaseAdmin
      .from('trainer_assignments')
      .select('id')
      .eq('trainer_id', currentUser.id)
      .eq('user_id', memberId)
      .eq('is_active', true)
      .single();

    if (!assignment) {
      return { success: false, error: 'You are not assigned to this member' };
    }
  }

  try {
    // Deactivate any existing active workout plan
    await supabaseAdmin
      .from('user_workout_plans')
      .update({ is_active: false })
      .eq('user_id', memberId)
      .eq('is_active', true);

    // Calculate end date if duration provided
    const startDate = new Date();
    let endDate = null;
    if (durationWeeks) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + (durationWeeks * 7));
    }

    // Create new assignment
    const { error } = await supabaseAdmin
      .from('user_workout_plans')
      .insert({
        user_id: memberId,
        workout_plan_id: planId,
        assigned_by: currentUser.id,
        assigned_at: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        is_active: true,
      });

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidatePath('/trainer/members');
    revalidatePath('/user/workout');
    revalidatePath('/user/dashboard');
    
    return { success: true, message: 'Workout plan assigned successfully' };
  } catch (error) {
    console.error('Error assigning workout plan:', error);
    return { success: false, error: 'Failed to assign workout plan' };
  }
}

export async function unassignWorkoutPlanFromMember(memberId: string) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('user_workout_plans')
      .update({ is_active: false })
      .eq('user_id', memberId)
      .eq('is_active', true);

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidatePath('/trainer/members');
    revalidatePath('/user/workout');
    
    return { success: true, message: 'Workout plan unassigned' };
  } catch (error) {
    console.error('Error unassigning workout:', error);
    return { success: false, error: 'Failed to unassign workout plan' };
  }
}

// ==========================================
// DIET PLAN ASSIGNMENT ACTIONS
// ==========================================

export async function assignDietPlanToMember(
  planId: string, 
  memberId: string,
  durationWeeks?: number
) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  // If trainer, verify they are assigned to this member
  if (currentUser.role === 'trainer') {
    const { data: assignment } = await supabaseAdmin
      .from('trainer_assignments')
      .select('id')
      .eq('trainer_id', currentUser.id)
      .eq('user_id', memberId)
      .eq('is_active', true)
      .single();

    if (!assignment) {
      return { success: false, error: 'You are not assigned to this member' };
    }
  }

  try {
    // Deactivate any existing active diet plan
    await supabaseAdmin
      .from('user_diet_plans')
      .update({ is_active: false })
      .eq('user_id', memberId)
      .eq('is_active', true);

    // Calculate end date if duration provided
    const startDate = new Date();
    let endDate = null;
    if (durationWeeks) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + (durationWeeks * 7));
    }

    // Create new assignment
    const { error } = await supabaseAdmin
      .from('user_diet_plans')
      .insert({
        user_id: memberId,
        diet_plan_id: planId,
        assigned_by: currentUser.id,
        assigned_at: startDate.toISOString(),
        end_date: endDate?.toISOString() || null,
        is_active: true,
      });

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidatePath('/trainer/members');
    revalidatePath('/user/diet');
    revalidatePath('/user/dashboard');
    
    return { success: true, message: 'Diet plan assigned successfully' };
  } catch (error) {
    console.error('Error assigning diet plan:', error);
    return { success: false, error: 'Failed to assign diet plan' };
  }
}

export async function unassignDietPlanFromMember(memberId: string) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('user_diet_plans')
      .update({ is_active: false })
      .eq('user_id', memberId)
      .eq('is_active', true);

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidatePath('/trainer/members');
    revalidatePath('/user/diet');
    
    return { success: true, message: 'Diet plan unassigned' };
  } catch (error) {
    console.error('Error unassigning diet:', error);
    return { success: false, error: 'Failed to unassign diet plan' };
  }
}

// ==========================================
// PROGRESS LOG ACTIONS
// ==========================================

export async function logMemberProgress(
  memberId: string,
  data: {
    weight_kg: number;
    body_fat_percentage?: number;
    muscle_mass_kg?: number;
    notes?: string;
  }
) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  // If trainer, verify they are assigned to this member
  if (currentUser.role === 'trainer') {
    const { data: assignment } = await supabaseAdmin
      .from('trainer_assignments')
      .select('id')
      .eq('trainer_id', currentUser.id)
      .eq('user_id', memberId)
      .eq('is_active', true)
      .single();

    if (!assignment) {
      return { success: false, error: 'You are not assigned to this member' };
    }
  }

  try {
    // Get member height for BMI calculation
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('height_cm')
      .eq('user_id', memberId)
      .single();

    let bmi = null;
    if (profile?.height_cm && data.weight_kg) {
      const heightM = profile.height_cm / 100;
      bmi = Math.round((data.weight_kg / (heightM * heightM)) * 10) / 10;
    }

    // Create progress log
    const { error: logError } = await supabaseAdmin
      .from('progress_logs')
      .insert({
        user_id: memberId,
        weight_kg: data.weight_kg,
        bmi,
        body_fat_percentage: data.body_fat_percentage,
        muscle_mass_kg: data.muscle_mass_kg,
        notes: data.notes,
        logged_by: currentUser.id,
      });

    if (logError) throw logError;

    // Update user profile with latest weight and BMI
    await supabaseAdmin
      .from('user_profiles')
      .update({
        current_weight_kg: data.weight_kg,
        bmi,
      })
      .eq('user_id', memberId);

    revalidatePath('/admin/members');
    revalidatePath('/admin/members/[id]', 'page');
    revalidatePath('/trainer/members');
    revalidatePath('/trainer/members/[id]', 'page');
    revalidatePath('/trainer/progress');
    revalidatePath('/user/progress');
    revalidatePath('/user/profile');
    revalidatePath('/user/dashboard');
    
    return { success: true, message: 'Progress logged successfully' };
  } catch (error) {
    console.error('Error logging progress:', error);
    return { success: false, error: 'Failed to log progress' };
  }
}

// ==========================================
// ATTENDANCE ACTIONS
// ==========================================

export async function markAttendance(
  memberId: string,
  action: 'check_in' | 'check_out'
) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  try {
    // Check for existing attendance today
    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('user_id', memberId)
      .eq('date', today)
      .single();

    if (action === 'check_in') {
      if (existing && existing.check_in_time && !existing.check_out_time) {
        return { success: false, error: 'Member is already checked in' };
      }

      if (existing && existing.check_out_time) {
        return { success: false, error: 'Member has already completed today\'s session' };
      }

      // Get member's gym_id
      const { data: member } = await supabaseAdmin
        .from('users')
        .select('gym_id')
        .eq('id', memberId)
        .single();

      await supabaseAdmin.from('attendance').insert({
        user_id: memberId,
        gym_id: member?.gym_id || currentUser.gym_id,
        date: today,
        check_in_time: now,
        marked_by: currentUser.id,
      });

      revalidatePath('/admin/attendance');
      revalidatePath('/trainer/attendance');
      revalidatePath('/user/attendance');
      
      return { success: true, message: 'Checked in successfully' };
    } else {
      if (!existing || !existing.check_in_time) {
        return { success: false, error: 'Member has not checked in today' };
      }

      if (existing.check_out_time) {
        return { success: false, error: 'Member has already checked out' };
      }

      await supabaseAdmin
        .from('attendance')
        .update({ check_out_time: now })
        .eq('id', existing.id);

      revalidatePath('/admin/attendance');
      revalidatePath('/trainer/attendance');
      revalidatePath('/user/attendance');
      
      return { success: true, message: 'Checked out successfully' };
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: 'Failed to mark attendance' };
  }
}

// ==========================================
// UPDATE MEMBER PROFILE
// ==========================================

export async function updateMemberProfile(
  memberId: string,
  data: {
    height_cm?: number;
    current_weight_kg?: number;
    target_weight_kg?: number;
    fitness_goal?: string;
    experience_level?: string;
    health_conditions?: string;
    date_of_birth?: string;
    age?: number;
    membership_start_date?: string;
    membership_end_date?: string;
  }
) {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin', 'trainer'].includes(currentUser.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Update Profile Data
    // Check if profile exists and get current values
    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('id, height_cm, current_weight_kg')
      .eq('user_id', memberId)
      .single();

    // Get height and weight for BMI calculation (use new value or existing)
    const height = data.height_cm || existing?.height_cm;
    const weight = data.current_weight_kg || existing?.current_weight_kg;
    
    // Calculate BMI if we have both height and weight
    let bmi = null;
    if (height && weight) {
      const heightM = height / 100;
      bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
    }

    // Filter out membership dates for profile update
    const { membership_start_date, membership_end_date, ...profileData } = data;

    if (existing) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ ...profileData, bmi })
        .eq('user_id', memberId);
    } else {
      await supabaseAdmin.from('user_profiles').insert({
        user_id: memberId,
        ...profileData,
        bmi,
      });
    }

    // 2. Update Membership Dates (if provided)
    // Only admins/superusers should change membership dates, but we'll allow trainer if role check passed above
    if (membership_start_date || membership_end_date) {
      // Find active membership
      const { data: activeMembership } = await supabaseAdmin
        .from('user_memberships')
        .select('id')
        .eq('user_id', memberId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .single();
      
      const updates: any = {};
      if (membership_start_date) updates.start_date = membership_start_date;
      if (membership_end_date) updates.end_date = membership_end_date;

      if (activeMembership) {
        await supabaseAdmin
          .from('user_memberships')
          .update(updates)
          .eq('id', activeMembership.id);
      } else if (membership_end_date) {
        // Create new membership if none exists and we have an end date
        await supabaseAdmin
          .from('user_memberships')
          .insert({
            user_id: memberId,
            start_date: membership_start_date || new Date().toISOString().split('T')[0],
            end_date: membership_end_date,
            status: 'active',
            // plan_id is optional, so we can leave it null for manual memberships
          });
      }
    }

    // Revalidate all relevant paths
    revalidatePath('/admin/members');
    revalidatePath('/admin/members/[id]', 'page');
    revalidatePath('/trainer/members');
    revalidatePath('/trainer/members/[id]', 'page');
    revalidatePath('/user/profile');
    revalidatePath('/user/dashboard');
    revalidatePath('/user/progress');
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ==========================================
// FETCH HELPERS FOR UI
// ==========================================

export async function getAvailableTrainers(gymId: string) {
  const { data: trainers } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('role', 'trainer')
    .eq('gym_id', gymId)
    .eq('is_active', true);

  return trainers || [];
}

export async function getAvailableWorkoutPlans(gymId: string) {
  const { data: plans } = await supabaseAdmin
    .from('workout_plans')
    .select('id, name, description, difficulty, duration_weeks')
    .eq('gym_id', gymId);

  return plans || [];
}

export async function getAvailableDietPlans(gymId: string) {
  const { data: plans } = await supabaseAdmin
    .from('diet_plans')
    .select('id, name, description, diet_preference, total_calories')
    .eq('gym_id', gymId);

  return plans || [];
}

export async function getMemberAssignments(memberId: string) {
  const [
    { data: trainers },
    { data: workout },
    { data: diet }
  ] = await Promise.all([
    supabaseAdmin
      .from('trainer_assignments')
      .select('*, users:trainer_id(id, first_name, last_name, email)')
      .eq('user_id', memberId)
      .eq('is_active', true),
    supabaseAdmin
      .from('user_workout_plans')
      .select('*, workout_plans(*)')
      .eq('user_id', memberId)
      .eq('is_active', true)
      .single(),
    supabaseAdmin
      .from('user_diet_plans')
      .select('*, diet_plans(*)')
      .eq('user_id', memberId)
      .eq('is_active', true)
      .single(),
  ]);

  return {
    trainers: trainers || [],
    workout,
    diet,
  };
}

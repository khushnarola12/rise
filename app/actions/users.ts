'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserData } from '@/lib/auth';
import { UserRole } from '@/lib/supabase';

interface CreateUserState {
  message?: string;
  error?: string;
}

export async function createUser(
  prevState: CreateUserState, 
  formData: FormData
): Promise<CreateUserState> {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    return { error: 'Unauthorized: You do not have permission to create users.' };
  }

  const role = formData.get('role') as UserRole;
  const email = formData.get('email') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  
  // Specific fields for members if needed in future
  // const height = formData.get('height'); 
  // const weight = formData.get('weight');

  if (!email || !firstName || !lastName || !role) {
    return { error: 'Missing required fields' };
  }

  // Validate role permissions
  if (role === 'admin' && currentUser.role !== 'superuser') {
    return { error: 'Only superusers can create admins.' };
  }
  if (role === 'superuser') {
    return { error: 'Cannot create superuser.' };
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { error: `User with email ${email} already exists.` };
    }

    // Generate placeholder ID
    const placeholderClerkId = `invite_${role}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Insert User
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        clerk_id: placeholderClerkId,
        gym_id: currentUser.gym_id,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return { error: 'Database error: Failed to create user account.' };
    }

    // --- FINANCIAL LOGIC ---

    // 1. Handle Membership Plan (for Users)
    const planId = formData.get('planId') as string;
    if (role === 'user' && planId) {
      // Fetch plan details
      const { data: plan } = await supabaseAdmin
        .from('membership_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        // Create Membership Record
        await supabaseAdmin.from('user_memberships').insert({
          user_id: newUser.id,
          plan_id: plan.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          amount_paid: plan.price
        });

        // Record Revenue Transaction
        await supabaseAdmin.from('financial_transactions').insert({
          gym_id: currentUser.gym_id,
          type: 'revenue',
          category: 'membership',
          amount: plan.price,
          description: `Membership: ${plan.name} - ${firstName} ${lastName}`,
          related_user_id: newUser.id
        });
        
        // Initialize Profile
        await supabaseAdmin.from('user_profiles').insert({
          user_id: newUser.id
        });
      }
    } else if (role === 'user') {
      // Initialize Profile without plan
      await supabaseAdmin.from('user_profiles').insert({
        user_id: newUser.id
      });
    }

    // 2. Handle Salary (for Trainers)
    const salary = formData.get('salary');
    if (role === 'trainer' && salary) {
      // Create profile if not exists (trainers might need profiles too)
      await supabaseAdmin.from('user_profiles').insert({
        user_id: newUser.id,
        salary: Number(salary)
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred.' };
  }

  const redirectPath = role === 'trainer' ? '/admin/trainers' : '/admin/members';
  revalidatePath(redirectPath);
  redirect(redirectPath);
}

export async function deleteUser(userId: string, role: string) {
  const currentUser = await getCurrentUserData();
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    throw new Error('Unauthorized');
  }

  // 1. Unlink Financial Transactions (Preserve history, remove link)
  await supabaseAdmin
    .from('financial_transactions')
    .update({ related_user_id: null })
    .eq('related_user_id', userId);

  // 2. Unlink Created Content (if Trainer/Admin)
  await supabaseAdmin.from('workout_plans').update({ created_by: null }).eq('created_by', userId);
  await supabaseAdmin.from('diet_plans').update({ created_by: null }).eq('created_by', userId);
  
  // 3. Unlink Assignments (assigned_by)
  await supabaseAdmin.from('user_workout_plans').update({ assigned_by: null }).eq('assigned_by', userId);
  await supabaseAdmin.from('user_diet_plans').update({ assigned_by: null }).eq('assigned_by', userId);

  // 4. Hard Delete User (Cascades to profiles, etc.)
  const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
  
  if (error) {
    console.error('Delete failed:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
  
  revalidatePath('/admin/trainers');
  revalidatePath('/admin/members');
}

export async function toggleUserStatus(userId: string, isActive: boolean, role: string) {
  const currentUser = await getCurrentUserData();
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);
    
  if (error) throw error;

  revalidatePath('/admin/trainers');
  revalidatePath('/admin/members');
}

export async function updateUser(userId: string, formData: FormData) {
  const currentUser = await getCurrentUserData();
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    throw new Error('Unauthorized');
  }

  const role = formData.get('role') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  
  // Update User Basic Info
  const { error: userError } = await supabaseAdmin
    .from('users')
    .update({ first_name: firstName, last_name: lastName, phone })
    .eq('id', userId);

  if (userError) throw userError;

  // Update Salary (if Trainer)
  const salary = formData.get('salary');
  if (role === 'trainer' && salary) {
    // Check if profile exists
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profile) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ salary: Number(salary) })
        .eq('user_id', userId);
    } else {
       await supabaseAdmin.from('user_profiles').insert({
        user_id: userId,
        salary: Number(salary)
      });
    }
  }

  const redirectPath = role === 'trainer' ? '/admin/trainers' : '/admin/members';
  revalidatePath(redirectPath);
  redirect(redirectPath);
}

'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserData } from '@/lib/auth';
import { UserRole } from '@/lib/supabase';
import { sendInvitationEmail } from '@/lib/email';
import { clerkClient } from '@clerk/nextjs/server';

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
      const existingRole = existingUser.role === 'user' ? 'Member' : existingUser.role.charAt(0).toUpperCase() + existingUser.role.slice(1);
      return { error: `This user cannot be assigned multiple roles. The email "${email}" is already registered as a ${existingRole}.` };
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
      const { data: plan } = await supabaseAdmin
        .from('membership_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        await supabaseAdmin.from('user_memberships').insert({
          user_id: newUser.id,
          plan_id: plan.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          amount_paid: plan.price
        });

        await supabaseAdmin.from('financial_transactions').insert({
          gym_id: currentUser.gym_id,
          type: 'revenue',
          category: 'membership',
          amount: plan.price,
          description: `Membership: ${plan.name} - ${firstName} ${lastName}`,
          related_user_id: newUser.id
        });
        
        await supabaseAdmin.from('user_profiles').insert({
          user_id: newUser.id
        });
      }
    } else if (role === 'user') {
      await supabaseAdmin.from('user_profiles').insert({
        user_id: newUser.id
      });
    }

    // 2. Handle Salary (for Trainers)
    const salary = formData.get('salary');
    if (role === 'trainer' && salary) {
      await supabaseAdmin.from('user_profiles').insert({
        user_id: newUser.id,
        salary: Number(salary)
      });
    }

    // 3. Send Invitation Email
    const inviteResult = await sendInvitationEmail(email, role as 'admin' | 'trainer' | 'user', firstName, lastName);
    
    if (!inviteResult.success) {
      console.warn(`User created but invitation email failed: ${inviteResult.message}`);
    } else {
      console.log(`✅ ${role} created and invitation sent: ${email}`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred.' };
  }

  let redirectPath = '/admin/members';
  if (role === 'trainer') redirectPath = '/admin/trainers';
  else if (role === 'admin') redirectPath = '/superuser/admins';
  
  revalidatePath(redirectPath);
  redirect(redirectPath);
}

export async function deleteUser(userId: string, role: string) {
  const currentUser = await getCurrentUserData();
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    throw new Error('Unauthorized');
  }

  // 0. Fetch user to get clerk_id before deletion
  const { data: userToDelete } = await supabaseAdmin
    .from('users')
    .select('clerk_id')
    .eq('id', userId)
    .single();

  // 1. Unlink Financial Transactions (Preserve history, remove link)
  await supabaseAdmin
    .from('financial_transactions')
    .update({ related_user_id: null })
    .eq('related_user_id', userId);

  // 2. Unlink Created Content (if Trainer/Admin)
  await supabaseAdmin.from('workout_plans').update({ created_by: null }).eq('created_by', userId);
  await supabaseAdmin.from('diet_plans').update({ created_by: null }).eq('created_by', userId);
  await supabaseAdmin.from('announcements').update({ created_by: null }).eq('created_by', userId);
  
  // 3. Unlink Assignments & Logs
  await supabaseAdmin.from('user_workout_plans').update({ assigned_by: null }).eq('assigned_by', userId);
  await supabaseAdmin.from('user_diet_plans').update({ assigned_by: null }).eq('assigned_by', userId);
  await supabaseAdmin.from('trainer_assignments').update({ assigned_by: null }).eq('assigned_by', userId);
  await supabaseAdmin.from('attendance').update({ marked_by: null }).eq('marked_by', userId);
  await supabaseAdmin.from('progress_logs').update({ logged_by: null }).eq('logged_by', userId);

  // 4. Hard Delete User (Cascades to profiles, etc.)
  const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
  
  if (error) {
    console.error('Delete failed:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  // 5. Delete from Clerk if linked
  if (userToDelete?.clerk_id && userToDelete.clerk_id.startsWith('user_')) {
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(userToDelete.clerk_id);
      console.log('Deleted Clerk user:', userToDelete.clerk_id);
    } catch (e) {
      console.error('Failed to delete Clerk user:', e);
    }
  }
  
  if (role === 'admin') {
    revalidatePath('/superuser/admins');
  } else {
    revalidatePath('/admin/trainers');
    revalidatePath('/admin/members');
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean, role: string) {
  const currentUser = await getCurrentUserData();
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    throw new Error('Unauthorized');
  }

  // Update the target user's status
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);
    
  if (error) throw error;

  // ====================================================
  // GYM-WIDE CASCADE: When superuser deactivates/activates an ADMIN
  // All members, trainers in that gym are also affected
  // ====================================================
  if (role === 'admin' && currentUser.role === 'superuser') {
    // Get the admin's gym_id
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('gym_id, first_name, last_name')
      .eq('id', userId)
      .single();

    if (adminUser?.gym_id) {
      const gymId = adminUser.gym_id;

      // Get the gym name for the notification
      const { data: gym } = await supabaseAdmin
        .from('gyms')
        .select('name')
        .eq('id', gymId)
        .single();

      const gymName = gym?.name || 'your gym';

      // Get all users in this gym (trainers + members + the admin itself)
      const { data: gymUsers } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('gym_id', gymId);

      if (gymUsers && gymUsers.length > 0) {
        // Cascade status change to all trainers and members in the gym
        const usersToUpdate = gymUsers.filter(u => u.role !== 'superuser' && u.id !== userId);
        
        if (usersToUpdate.length > 0) {
          await supabaseAdmin
            .from('users')
            .update({ is_active: isActive })
            .eq('gym_id', gymId)
            .in('role', ['trainer', 'user']);
        }

        // Create notifications for ALL affected users (admin + trainers + members)
        const notificationTitle = isActive 
          ? '🎉 Gym Reactivated!' 
          : '⚠️ Gym Deactivated';
        
        const notificationMessage = isActive
          ? `Great news! "${gymName}" has been reactivated. You can now use the system again. Welcome back!`
          : `"${gymName}" has been deactivated by the system administrator. Please contact your gym owner for more information. You will not be able to use the system until it is reactivated.`;

        const notificationType = isActive ? 'gym_activated' : 'gym_deactivated';

        // Insert notifications for all gym users
        const notifications = gymUsers
          .filter(u => u.role !== 'superuser')
          .map(u => ({
            user_id: u.id,
            gym_id: gymId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            is_read: false,
          }));

        if (notifications.length > 0) {
          await supabaseAdmin
            .from('notifications')
            .insert(notifications);
        }
      }
    }

    revalidatePath('/superuser/admins');
    revalidatePath('/superuser/dashboard');
  } else {
    revalidatePath('/admin/trainers');
    revalidatePath('/admin/members');
  }
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

  let redirectPath = '/admin/members';
  if (role === 'trainer') redirectPath = '/admin/trainers';
  else if (role === 'admin') redirectPath = '/superuser/admins';

  revalidatePath(redirectPath);
  redirect(redirectPath);
}

export async function resendUserInvitation(userId: string, role: string) {
  const currentUser = await getCurrentUserData();
  if (!currentUser || !['superuser', 'admin'].includes(currentUser.role)) {
    throw new Error('Unauthorized');
  }

  // Fetch user details
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, first_name, last_name')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const result = await sendInvitationEmail(
    user.email,
    role as 'admin' | 'trainer' | 'user',
    user.first_name,
    user.last_name
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}

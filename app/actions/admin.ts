'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUserData } from '@/lib/auth';

interface CreateAdminState {
  message?: string;
  error?: string;
}

export async function createAdmin(prevState: CreateAdminState, formData: FormData): Promise<CreateAdminState> {
  const currentUser = await getCurrentUserData();
  
  if (!currentUser || currentUser.role !== 'superuser') {
    return { error: 'Unauthorized: Only superusers can create admins.' };
  }

  // Admin details
  const email = formData.get('email') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;

  // Gym profile details
  const gymName = formData.get('gymName') as string;
  const gymAddress = formData.get('gymAddress') as string;
  const gymPhone = formData.get('gymPhone') as string;
  const gymEmail = formData.get('gymEmail') as string;
  const gymDescription = formData.get('gymDescription') as string;

  if (!email || !firstName || !lastName) {
    return { error: 'Missing required admin fields (name, email)' };
  }

  if (!gymName) {
    return { error: 'Gym name is required' };
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      if (existingUser.role === 'admin') {
        return { error: 'A user with this email is already an admin.' };
      } else {
        // Option to upgrade user? For now just error.
        return { error: `User already exists with role: ${existingUser.role}. Edit their profile to change role.` };
      }
    }

    // Step 1: Create the gym profile first
    const { data: newGym, error: gymError } = await supabaseAdmin
      .from('gyms')
      .insert({
        name: gymName,
        address: gymAddress || null,
        phone: gymPhone || null,
        email: gymEmail || null,
        description: gymDescription || null
      })
      .select()
      .single();

    if (gymError || !newGym) {
      console.error('Error creating gym:', gymError);
      return { error: 'Database error: Failed to create gym profile.' };
    }

    // Step 2: Create the admin record with a placeholder clerk_id
    // This allows the user to be created in Supabase BEFORE they sign up in Clerk
    // When they sign up, lib/auth.ts will find them by email and update the clerk_id
    const placeholderClerkId = `invite_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: 'admin',
        clerk_id: placeholderClerkId, // Temporary ID until they sign up
        gym_id: newGym.id, // Link admin to their new gym
        is_active: true
      });

    if (insertError) {
      console.error('Error creating admin:', insertError);
      // Rollback: Delete the gym we just created
      await supabaseAdmin.from('gyms').delete().eq('id', newGym.id);
      return { error: 'Database error: Failed to create admin account.' };
    }

    // TODO: Send invitation email (e.g. via Resend or Clerk)
    console.log(`Admin created: ${email} for gym: ${gymName}. Invitation logic here.`);

  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'An unexpected error occurred.' };
  }

  revalidatePath('/superuser/admins');
  redirect('/superuser/admins');
}


import { auth, currentUser } from '@clerk/nextjs/server';
import { type User, type UserRole } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { cache } from 'react';

/**
 * Get the current user's data from Supabase
 * This syncs Clerk user with Supabase and returns role + gym info
 * Wrapped in React cache for request deduping
 */
export const getCurrentUserData = cache(async (): Promise<User | null> => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    // Check if user exists in Supabase
    const { data: existingUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
      return null;
    }

    // If user doesn't exist by ID, check if they exist by email (invited user)
    if (!existingUser) {
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return null;
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress;

      // 1. Check if this is the superuser email (Auto-create superuser)
      const isSuperuser = email === process.env.SUPERUSER_EMAIL;

      if (isSuperuser) {
        // Create superuser
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: userId,
            email: email,
            first_name: clerkUser.firstName,
            last_name: clerkUser.lastName,
            role: 'superuser' as UserRole,
            avatar_url: clerkUser.imageUrl,
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating superuser:', createError);
          return null;
        }
        return newUser;
      }

      // 2. Check if user exists by email (Invited User)
      const { data: invitedUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (invitedUser) {
        // Update the invited user with their actual Clerk ID
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            clerk_id: userId,
            first_name: clerkUser.firstName || invitedUser.first_name,
            last_name: clerkUser.lastName || invitedUser.last_name,
            avatar_url: clerkUser.imageUrl || invitedUser.avatar_url,
            is_active: true // Ensure they are active upon claiming
          })
          .eq('id', invitedUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error claiming user account:', updateError);
          return null;
        }
        return updatedUser;
      }

      // 3. User truly doesn't exist
      console.error('User not found in database. Must be created by admin first.');
      return null;
    }

    // Fix: If user exists but has no gym_id (legacy/dev data issue), assign the default gym
    if (existingUser && !existingUser.gym_id) {
      const { data: defaultGym } = await supabaseAdmin.from('gyms').select('id').single();
      
      if (defaultGym) {
        const { data: fixedUser } = await supabaseAdmin
          .from('users')
          .update({ gym_id: defaultGym.id })
          .eq('id', existingUser.id)
          .select()
          .single();
          
        return fixedUser || existingUser;
      }
    }

    return existingUser;
  } catch (error) {
    console.error('Error in getCurrentUserData:', error);
    return null;
  }
});

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUserData();
  
  if (!user) {
    return false;
  }

  return requiredRoles.includes(user.role);
}

/**
 * Get user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUserData();
  return user?.role || null;
}

/**
 * Check if user is superuser
 */
export async function isSuperuser(): Promise<boolean> {
  return hasRole(['superuser']);
}

/**
 * Check if user is admin or superuser
 */
export async function isAdminOrAbove(): Promise<boolean> {
  return hasRole(['superuser', 'admin']);
}

/**
 * Check if user is trainer or above
 */
export async function isTrainerOrAbove(): Promise<boolean> {
  return hasRole(['superuser', 'admin', 'trainer']);
}

/**
 * Get redirect URL based on user role
 */
export function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case 'superuser':
      return '/superuser/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'trainer':
      return '/trainer/dashboard';
    case 'user':
      return '/user/dashboard';
    default:
      return '/';
  }
}

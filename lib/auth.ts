import { auth, currentUser } from '@clerk/nextjs/server';
import { type User, type UserRole } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { cache } from 'react';

/**
 * Get the current user's data (Server Side)
 * Uses Clerk Authentication and syncs with Supabase DB
 */
export const getCurrentUserData = cache(async (): Promise<User | null> => {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId || !clerkUser) {
      return null;
    }

    // 1. Try to find user by Clerk ID
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (existingUser) {
        return existingUser;
    }

    // 2. Fallback: Check by email (Migration scenario)
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (email) {
       const { data: emailUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
       if (emailUser) {
         // Link the account by updating clerk_id
         const { data: linkedUser } = await supabaseAdmin
           .from('users')
           .update({ 
             clerk_id: userId,
             avatar_url: clerkUser.imageUrl
           })
           .eq('id', emailUser.id)
           .select()
           .single();
           
         return linkedUser || emailUser;
       }
    }

    // 3. Auto-create user record if missing (JIT Provisioning)
    console.log('Auto-creating user record for Clerk user:', userId);
    
    // Check if it's the superuser email
    const isSuperuser = email === process.env.SUPERUSER_EMAIL;
    const role: UserRole = isSuperuser ? 'superuser' : (clerkUser.publicMetadata.role as UserRole || 'user');

    const { data: newUser } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: userId,
        email: email,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        role: role,
        avatar_url: clerkUser.imageUrl,
        is_active: true,
      })
      .select()
      .single();

    return newUser;

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

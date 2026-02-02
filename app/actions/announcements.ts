'use server';

import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

// ============================================
// ANNOUNCEMENT SYSTEM
// ============================================

export interface Announcement {
  id: string;
  gym_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'important';
  created_by: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
  };
}

/**
 * Create a new announcement (Admin/Superuser only)
 */
export async function createAnnouncement(data: {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'important';
  ends_at?: string;
}) {
  const user = await getCurrentUserData();
  
  if (!user || !['superuser', 'admin'].includes(user.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabaseAdmin
    .from('announcements')
    .insert({
      gym_id: user.gym_id,
      title: data.title,
      content: data.content,
      type: data.type || 'info',
      created_by: user.id,
      is_active: true,
      starts_at: new Date().toISOString(),
      ends_at: data.ends_at || null,
    });

  if (error) {
    // If table doesn't exist, create it and try again
    if (error.code === '42P01') {
      return { success: false, error: 'Announcements table not found. Please run database migrations.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/trainer/dashboard');
  revalidatePath('/user/dashboard');
  return { success: true, message: 'Announcement created!' };
}

/**
 * Get active announcements for a gym
 */
export async function getActiveAnnouncements() {
  const user = await getCurrentUserData();
  
  if (!user?.gym_id) {
    return [];
  }

  const now = new Date().toISOString();
  
  try {
    const { data } = await supabaseAdmin
      .from('announcements')
      .select('*, author:created_by(first_name, last_name)')
      .eq('gym_id', user.gym_id)
      .eq('is_active', true)
      .lte('starts_at', now)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(5);

    return data || [];
  } catch {
    // Table might not exist
    return [];
  }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(announcementId: string) {
  const user = await getCurrentUserData();
  
  if (!user || !['superuser', 'admin'].includes(user.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabaseAdmin
    .from('announcements')
    .delete()
    .eq('id', announcementId)
    .eq('gym_id', user.gym_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true, message: 'Announcement deleted!' };
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementStatus(announcementId: string) {
  const user = await getCurrentUserData();
  
  if (!user || !['superuser', 'admin'].includes(user.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: existing } = await supabaseAdmin
    .from('announcements')
    .select('is_active')
    .eq('id', announcementId)
    .single();

  if (!existing) {
    return { success: false, error: 'Announcement not found' };
  }

  const { error } = await supabaseAdmin
    .from('announcements')
    .update({ is_active: !existing.is_active })
    .eq('id', announcementId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true, message: `Announcement ${existing.is_active ? 'disabled' : 'enabled'}!` };
}

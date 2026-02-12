'use server';

import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'gym_deactivated' | 'gym_activated';
  is_read: boolean;
  created_at: string;
}

export async function getUserNotifications() {
  const user = await getCurrentUserData();
  
  if (!user) return [];

  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return data as Notification[] || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await getCurrentUserData();
  
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/trainer/dashboard');
  revalidatePath('/user/dashboard');
  revalidatePath('/superuser/dashboard');
  
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUserData();
  
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/trainer/dashboard');
  revalidatePath('/user/dashboard');
  revalidatePath('/superuser/dashboard');
  
  return { success: true };
}

import { supabaseAdmin } from '@/lib/supabase-admin';

// Default revenue per admin
const DEFAULT_REVENUE_PER_ADMIN = 12000;

export async function getRevenuePerAdmin(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'revenue_per_admin')
      .single();

    if (error || !data) {
      return DEFAULT_REVENUE_PER_ADMIN;
    }

    return parseInt(data.value) || DEFAULT_REVENUE_PER_ADMIN;
  } catch {
    return DEFAULT_REVENUE_PER_ADMIN;
  }
}

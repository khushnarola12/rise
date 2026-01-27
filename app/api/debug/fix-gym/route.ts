import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // 1. Get the default gym
    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('id')
      .single(); // Should get the one we inserted in schema.sql

    if (!gym) {
      return NextResponse.json({ error: 'No gym found in database' }, { status: 404 });
    }

    // 2. Update users who have no gym
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .update({ gym_id: gym.id })
      .is('gym_id', null)
      .select();

    return NextResponse.json({ 
      success: true, 
      message: 'Fixed missing gym_ids', 
      gym_id: gym.id,
      updated_users: users 
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

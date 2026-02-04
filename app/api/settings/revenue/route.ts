import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch the revenue rate
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'revenue_per_admin')
      .single();

    if (error) {
      // If table doesn't exist or no data, return default
      return NextResponse.json({ revenuePerAdmin: 12000 });
    }

    return NextResponse.json({ 
      revenuePerAdmin: parseInt(data.value) || 12000 
    });
  } catch {
    return NextResponse.json({ revenuePerAdmin: 12000 });
  }
}

// POST: Update the revenue rate
export async function POST(request: NextRequest) {
  try {
    const { revenuePerAdmin } = await request.json();

    if (!revenuePerAdmin || isNaN(revenuePerAdmin)) {
      return NextResponse.json(
        { error: 'Invalid revenue amount' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({
        key: 'revenue_per_admin',
        value: revenuePerAdmin.toString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error('Error updating revenue rate:', error);
      return NextResponse.json(
        { error: 'Failed to update revenue rate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      revenuePerAdmin 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

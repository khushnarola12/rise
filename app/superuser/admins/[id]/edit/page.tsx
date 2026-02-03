import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import { EditAdminForm } from './client';

export const dynamic = 'force-dynamic';

export default async function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: admin } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!admin) {
    return notFound();
  }

  return <EditAdminForm admin={admin} />;
}

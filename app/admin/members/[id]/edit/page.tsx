import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import EditUserForm from '@/components/edit-user-form';

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  const { id } = await params;

  // Fetch Member Data
  const { data: member } = await supabaseAdmin
    .from('users')
    .select('*, user_profiles(*)')
    .eq('id', id)
    .eq('role', 'user')
    .eq('gym_id', user.gym_id)
    .single();

  if (!member) return notFound();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/members"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Member</h1>
          <p className="text-muted-foreground">Update member details</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
             {member.avatar_url ? (
                <img src={member.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
             ) : (
                <Users className="w-10 h-10 text-blue-500" />
             )}
          </div>
          <p className="text-sm text-muted-foreground">ID: {member.id}</p>
        </div>

        <EditUserForm user={member} role="user" />
      </div>
    </div>
  );
}

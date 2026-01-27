import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ArrowLeft, UserCog } from 'lucide-react';
import Link from 'next/link';
import EditUserForm from '@/components/edit-user-form';

export default async function EditTrainerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  const { id } = await params;

  // Fetch Trainer Data + Profile (Salary)
  const { data: trainer } = await supabaseAdmin
    .from('users')
    .select('*, user_profiles(*)')
    .eq('id', id)
    .eq('role', 'trainer')
    .eq('gym_id', user.gym_id)
    .single();

  if (!trainer) return notFound();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/trainers"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Trainer</h1>
          <p className="text-muted-foreground">Update trainer details</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
             {trainer.avatar_url ? (
                <img src={trainer.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
             ) : (
                <UserCog className="w-10 h-10 text-primary" />
             )}
          </div>
          <p className="text-sm text-muted-foreground">ID: {trainer.id}</p>
        </div>

        <EditUserForm user={trainer} role="trainer" />
      </div>
    </div>
  );
}

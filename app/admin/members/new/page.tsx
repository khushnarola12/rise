import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MemberForm from './member-form';

export default async function NewMemberPage() {
  const user = await getCurrentUserData();
  
  // Fetch available plans
  let plans: any[] = [];
  if (user?.gym_id) {
    const { data } = await supabaseAdmin
      .from('membership_plans')
      .select('*')
      .eq('gym_id', user.gym_id);
      
    if (data) plans = data;
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/admin/members"
          className="p-2 hover:bg-muted rounded-full transition-colors touch-manipulation"
          aria-label="Back to members"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Add New Member</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Register a new gym member</p>
        </div>
      </div>

      <MemberForm plans={plans} />
    </div>
  );
}

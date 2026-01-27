import { getCurrentUserData } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DietPlanForm from './diet-plan-form';

export default async function NewDietPlanPage() {
  const user = await getCurrentUserData();
  
  if (!user?.gym_id || !user?.id) {
    redirect('/admin/dashboard');
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          href="/admin/diets"
          className="p-2 hover:bg-muted rounded-full transition-colors touch-manipulation"
          aria-label="Back to diet plans"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create Diet Plan</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Design a new nutrition program</p>
        </div>
      </div>

      <DietPlanForm gymId={user.gym_id} createdBy={user.id} />
    </div>
  );
}

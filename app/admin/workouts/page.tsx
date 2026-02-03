import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Dumbbell, Plus, Search, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { PlanActionsMenu } from '@/components/plan-actions-menu';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  const { data: plans } = await supabaseAdmin
    .from('workout_plans')
    .select('*, users(first_name, last_name)')
    .eq('gym_id', user.gym_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workout Plans</h1>
          <p className="text-muted-foreground">Manage training programs</p>
        </div>
        <Link
          href="/admin/workouts/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!plans || plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No workout plans found. Create one to get started!</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Link href={`/admin/workouts/${plan.id}`} className="flex-1">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {plan.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    {plan.difficulty && (
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium uppercase tracking-wider">
                        {plan.difficulty}
                      </span>
                    )}
                    <PlanActionsMenu 
                      planId={plan.id} 
                      planType="workout" 
                      planName={plan.name}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.description || 'No description provided.'}
                </p>
                <Link href={`/admin/workouts/${plan.id}`} className="text-sm font-medium text-primary hover:underline mt-2 inline-block">
                  View Details
                </Link>

                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {plan.duration_weeks} Weeks
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Users className="w-4 h-4" />
                    By {plan.users?.first_name || 'Admin'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


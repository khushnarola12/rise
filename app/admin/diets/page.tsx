import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Calendar, Plus, Search, Utensils, Users } from 'lucide-react';
import Link from 'next/link';
import { PlanActionsMenu } from '@/components/plan-actions-menu';

export const dynamic = 'force-dynamic';

export default async function DietPlansPage() {
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  const { data: plans } = await supabaseAdmin
    .from('diet_plans')
    .select('*, users(first_name, last_name)')
    .eq('gym_id', user.gym_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Diet Plans</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage nutrition programs</p>
        </div>
        <Link
          href="/admin/diets/new"
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 touch-manipulation"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Create Diet</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!plans || plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No diet plans found.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-green-500 transition-colors flex-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium uppercase tracking-wider">
                      {plan.total_calories} kcal
                    </span>
                    <PlanActionsMenu 
                      planId={plan.id} 
                      planType="diet" 
                      planName={plan.name}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Utensils className="w-4 h-4" />
                    {plan.diet_preference?.replace('_', ' ')}
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


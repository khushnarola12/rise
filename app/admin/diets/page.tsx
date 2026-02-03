import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentUserData } from '@/lib/auth';
import { Calendar, Plus, Search, Utensils, Users } from 'lucide-react';
import Link from 'next/link';
import { PlanActionsMenu } from '@/components/plan-actions-menu';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

export default async function DietPlansPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  let query = supabaseAdmin
    .from('diet_plans')
    .select('*, users(first_name, last_name)')
    .eq('gym_id', user.gym_id);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: plans } = await query.order('created_at', { ascending: false });

  const vegPlans = plans?.filter(p => p.diet_preference === 'veg') || [];
  const nonVegPlans = plans?.filter(p => p.diet_preference !== 'veg') || [];

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

      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search diet plans..." />
      </div>

      {!plans || plans.length === 0 ? (
        <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
          <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>{q ? `No diet plans found for "${q}"` : 'No diet plans found.'}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {vegPlans.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                Vegetarian Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vegPlans.map((plan) => <DietPlanCard key={plan.id} plan={plan} />)}
              </div>
            </section>
          )}

          {nonVegPlans.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                Non-Vegetarian & Other Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nonVegPlans.map((plan) => <DietPlanCard key={plan.id} plan={plan} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function DietPlanCard({ plan }: { plan: any }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className={`h-2 bg-gradient-to-r ${plan.diet_preference === 'veg' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'}`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <Link href={`/admin/diets/${plan.id}`} className="flex-1">
            <h3 className={`text-xl font-bold text-foreground transition-colors ${plan.diet_preference === 'veg' ? 'group-hover:text-green-500' : 'group-hover:text-red-500'}`}>
              {plan.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${plan.diet_preference === 'veg' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
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
        <Link href={`/admin/diets/${plan.id}`} className="text-sm font-medium text-primary hover:underline mt-2 inline-block">
          View Details
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            <span className="capitalize">{plan.diet_preference?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Users className="w-4 h-4" />
            By {plan.users?.first_name || 'Admin'}
          </div>
        </div>
      </div>
    </div>
  );
}


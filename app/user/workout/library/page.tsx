import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Dumbbell, Calendar, Users, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { URLSearchInput } from '@/components/url-search-input';

export const dynamic = 'force-dynamic';

export default async function UserWorkoutLibraryPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Workouts</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load workout plans. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch ALL workout plans in the gym
  const { data: plans } = await supabaseAdmin
    .from('workout_plans')
    .select('*, users:created_by(first_name, last_name)')
    .eq('gym_id', user.gym_id)
    .order('created_at', { ascending: false });

  // Count how many members are using each plan
  const planIds = plans?.map(p => p.id) || [];
  const { data: planUsage } = planIds.length > 0 ? await supabaseAdmin
    .from('user_workout_plans')
    .select('workout_plan_id, is_active')
    .in('workout_plan_id', planIds) : { data: [] };

  const usageMap = planUsage?.reduce((acc: any, usage: any) => {
    if (!acc[usage.workout_plan_id]) {
      acc[usage.workout_plan_id] = { total: 0, active: 0 };
    }
    acc[usage.workout_plan_id].total++;
    if (usage.is_active) acc[usage.workout_plan_id].active++;
    return acc;
  }, {}) || {};

  // Filter plans based on search query
  const filteredPlans = plans?.filter((plan) => {
    if (!q) return true;
    const authorName = plan.users ? `${plan.users.first_name} ${plan.users.last_name}` : '';
    const searchString = `${plan.name} ${plan.description} ${authorName}`.toLowerCase();
    return searchString.includes(q.toLowerCase());
  }) || [];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div>
        <Link
          href="/user/workout"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Plan
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Workout Library
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse all available workout programs in the gym
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <URLSearchInput placeholder="Search workout plans..." />
      </div>

      {/* Workout Plans Grid */}
      {filteredPlans && filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const usage = usageMap[plan.id] || { total: 0, active: 0 };
            
            return (
              <div
                key={plan.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {plan.name}
                    </h3>
                    {plan.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                        plan.difficulty === 'beginner' ? 'bg-green-500/10 text-green-500' :
                        plan.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {plan.difficulty}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {plan.duration_weeks && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {plan.duration_weeks} weeks
                      </div>
                    )}
                    {plan.target_muscle_groups && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" />
                        {Array.isArray(plan.target_muscle_groups) 
                          ? plan.target_muscle_groups.slice(0, 2).join(', ')
                          : plan.target_muscle_groups}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{usage.active}</span>
                        <span className="text-muted-foreground">active</span>
                      </div>
                    </div>
                    <Link
                      href={`/user/workout/library/${plan.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Workout Plans Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            There are no workout plans available matching your search.
          </p>
        </div>
      )}
    </div>
  );
}

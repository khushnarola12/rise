import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Dumbbell, Plus, Search, Calendar, Users, Target } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TrainerWorkoutsPage() {
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

  // Fetch ALL workout plans in the gym (trainer can see and assign any)
  const { data: plans, error } = await supabaseAdmin
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

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            My Workout Plans
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage workout programs for your members
          </p>
        </div>
        <Link
          href="/trainer/workouts/new"
          className="w-full sm:w-auto px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workout plans..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Workout Plans Grid */}
      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
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
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        By {plan.users?.first_name || 'Admin'}
                      </span>
                    </div>
                    <Link
                      href={`/trainer/workouts/${plan.id}`}
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
            No Workout Plans Yet
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first workout plan to assign to your members.
          </p>
          <Link
            href="/trainer/workouts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Create Your First Plan
          </Link>
        </div>
      )}
    </div>
  );
}

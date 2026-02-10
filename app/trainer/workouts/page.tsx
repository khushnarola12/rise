import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Dumbbell, Plus, Calendar, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { URLSearchInput } from '@/components/url-search-input';
import { ScrollReveal, StaggerContainer, StaggerItem, PageTransition } from '@/components/scroll-animations';

export const dynamic = 'force-dynamic';

const DIFFICULTY_CONFIG = {
  beginner: { color: 'from-emerald-500 to-green-400', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  intermediate: { color: 'from-amber-500 to-yellow-400', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  advanced: { color: 'from-rose-500 to-red-400', badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
} as const;

export default async function TrainerWorkoutsPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
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

  const { data: plans } = await supabaseAdmin
    .from('workout_plans')
    .select('*, users:created_by(first_name, last_name)')
    .eq('gym_id', user.gym_id)
    .order('created_at', { ascending: false });

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

  const filteredPlans = plans?.filter((plan) => {
    if (!q) return true;
    const authorName = plan.users ? `${plan.users.first_name} ${plan.users.last_name}` : '';
    const searchString = `${plan.name} ${plan.description} ${authorName}`.toLowerCase();
    return searchString.includes(q.toLowerCase());
  }) || [];

  return (
    <PageTransition className="space-y-6 sm:space-y-8">
      {/* Header */}
      <ScrollReveal>
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
            className="w-full sm:w-auto px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </Link>
        </div>
      </ScrollReveal>

      {/* Search */}
      <ScrollReveal delay={0.1}>
        <div className="mb-6 max-w-md">
          <URLSearchInput placeholder="Search workout plans..." />
        </div>
      </ScrollReveal>

      {/* Workout Plans Grid */}
      {filteredPlans && filteredPlans.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredPlans.map((plan, i) => {
            const usage = usageMap[plan.id] || { total: 0, active: 0 };
            const difficulty = (plan.difficulty as keyof typeof DIFFICULTY_CONFIG) || 'beginner';
            const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
            
            return (
              <StaggerItem key={plan.id}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg hover:border-border/80 transition-all duration-300">
                  <div className={`h-1.5 bg-gradient-to-r ${config.color} transition-all duration-300 group-hover:h-2`} />
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {plan.name}
                      </h3>
                      {plan.difficulty && (
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.badge}`}>
                          {plan.difficulty}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {plan.duration_weeks && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {plan.duration_weeks} weeks
                        </div>
                      )}
                      {plan.target_muscle_groups && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                          <Target className="w-3.5 h-3.5" />
                          {Array.isArray(plan.target_muscle_groups) 
                            ? plan.target_muscle_groups.slice(0, 2).join(', ')
                            : plan.target_muscle_groups}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground font-semibold">{usage.active}</span>
                          <span className="text-muted-foreground text-xs">active</span>
                        </div>
                        <span className="text-border">•</span>
                        <span className="text-xs text-muted-foreground">
                          By {plan.users?.first_name || 'Admin'}
                        </span>
                      </div>
                      <Link
                        href={`/trainer/workouts/${plan.id}`}
                        className="text-sm text-primary hover:underline font-medium hover:text-primary/80 transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
        <ScrollReveal delay={0.2}>
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
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
        </ScrollReveal>
      )}
    </PageTransition>
  );
}

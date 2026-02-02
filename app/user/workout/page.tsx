import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Dumbbell, Calendar, Clock, Target } from 'lucide-react';

export default async function UserWorkoutPage() {
  const user = await getCurrentUserData();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold">Error Loading Workouts</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to load your workout plans. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Fetch all assigned workout plans
  const { data: workoutPlans } = await supabaseAdmin
    .from('user_workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false });

  // Get active plan and fetch its details separately
  const activePlanAssignment = workoutPlans?.find(p => p.is_active);
  let activeWorkoutPlan: any = null;
  let exercises: any[] = [];

  if (activePlanAssignment?.workout_plan_id) {
    // Fetch the workout plan details
    const { data: planData } = await supabaseAdmin
      .from('workout_plans')
      .select('*')
      .eq('id', activePlanAssignment.workout_plan_id)
      .single();
    
    activeWorkoutPlan = planData;

    // Fetch exercises for this plan
    if (planData) {
      const { data: exerciseData } = await supabaseAdmin
        .from('workout_exercises')
        .select('*')
        .eq('workout_plan_id', planData.id)
        .order('exercise_order', { ascending: true });
      
      exercises = exerciseData || [];
    }
  }

  // Fetch previous plan details
  const previousPlans = workoutPlans?.filter(p => !p.is_active) || [];
  const previousPlanDetails: any[] = [];
  
  for (const plan of previousPlans.slice(0, 5)) {
    if (plan.workout_plan_id) {
      const { data: planData } = await supabaseAdmin
        .from('workout_plans')
        .select('id, name')
        .eq('id', plan.workout_plan_id)
        .single();
      
      if (planData) {
        previousPlanDetails.push({
          ...plan,
          workout_plan: planData
        });
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          My Workout Plan
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View your assigned workout routines and exercises
        </p>
      </div>

      {/* Active Workout Plan */}
      {activeWorkoutPlan ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <span className="inline-block px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-medium mb-2">
                  ✓ Active Plan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {activeWorkoutPlan.name}
                </h2>
                {activeWorkoutPlan.description && (
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    {activeWorkoutPlan.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {activeWorkoutPlan.difficulty && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="capitalize">{activeWorkoutPlan.difficulty}</span>
                  </div>
                )}
                {activeWorkoutPlan.duration_weeks && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{activeWorkoutPlan.duration_weeks} Weeks</span>
                  </div>
                )}
              </div>
            </div>

            {/* Exercise List */}
            {exercises.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                  Exercises ({exercises.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {exercises.map((exercise: any, index: number) => (
                    <div
                      key={exercise.id}
                      className="p-4 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">
                            {exercise.exercise_name}
                          </h4>
                          {exercise.day && (
                            <p className="text-xs text-muted-foreground capitalize mb-2">
                              {exercise.day}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            {exercise.sets && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                                {exercise.sets} sets
                              </span>
                            )}
                            {exercise.reps && (
                              <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded">
                                {exercise.reps} reps
                              </span>
                            )}
                            {exercise.rest_seconds && (
                              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded">
                                {exercise.rest_seconds}s rest
                              </span>
                            )}
                          </div>
                          {exercise.description && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No exercises added to this plan yet.</p>
              </div>
            )}

            {/* Plan Dates */}
            <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Started: {new Date(activePlanAssignment!.assigned_at).toLocaleDateString()}
              </div>
              {activePlanAssignment!.end_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Ends: {new Date(activePlanAssignment!.end_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Dumbbell className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No Active Workout Plan
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            You don't have an active workout plan assigned yet. Contact your trainer to get started with a personalized workout routine.
          </p>
        </div>
      )}

      {/* Previous Plans */}
      {previousPlanDetails.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Previous Plans
          </h3>
          <div className="space-y-2">
            {previousPlanDetails.map((plan: any) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {plan.workout_plan?.name || 'Unknown Plan'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(plan.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs flex-shrink-0">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { StatCard, GradientStatCard } from '@/components/stat-card';
import { User, Dumbbell, Calendar, Activity, TrendingUp, Users } from 'lucide-react';

export default async function UserDashboard() {
  const user = await getCurrentUserData();

  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  // Fetch assigned trainers
  const { data: trainers } = await supabaseAdmin
    .from('trainer_assignments')
    .select(`
      *,
      users:trainer_id (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('user_id', user?.id)
    .eq('is_active', true);

  // Fetch active plans
  const [
    { data: activeWorkout },
    { data: activeDiet },
    { count: attendanceCount },
    { data: recentProgress }
  ] = await Promise.all([
    supabaseAdmin
      .from('user_workout_plans')
      .select('*, workout_plans(*)')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single(),
    supabaseAdmin
      .from('user_diet_plans')
      .select('*, diet_plans(*)')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single(),
    supabaseAdmin
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabaseAdmin
      .from('progress_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('logged_at', { ascending: false })
      .limit(1)
  ]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Welcome back, {user?.first_name || 'Member'}! 🔥
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Let's crush your fitness goals today!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <GradientStatCard
          title="Current Weight"
          value={profile?.current_weight_kg ? `${profile.current_weight_kg} kg` : 'N/A'}
          icon={TrendingUp}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="BMI"
          value={profile?.bmi || 'N/A'}
          icon={Activity}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="This Month"
          value={attendanceCount || 0}
          icon={Calendar}
          gradient="gradient-accent"
        />
        <GradientStatCard
          title="My Trainers"
          value={trainers?.length || 0}
          icon={Users}
          gradient="gradient-warning"
        />
      </div>

      {/* Active Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">My Workout Plan</h3>
              <p className="text-sm text-muted-foreground">Current active plan</p>
            </div>
          </div>

          {activeWorkout ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold text-foreground mb-1">
                  {activeWorkout.workout_plans?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeWorkout.workout_plans?.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-medium capitalize">
                    {activeWorkout.workout_plans?.difficulty}
                  </span>
                  {activeWorkout.workout_plans?.duration_weeks && (
                    <span className="text-xs text-muted-foreground">
                      {activeWorkout.workout_plans.duration_weeks} weeks
                    </span>
                  )}
                </div>
              </div>
              <a
                href="/user/workout"
                className="block w-full px-4 py-2 bg-purple-500 text-white rounded-lg text-center font-medium hover:bg-purple-600 transition-colors"
              >
                View Full Plan
              </a>
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active workout plan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact your trainer to get started
              </p>
            </div>
          )}
        </div>

        {/* Diet Plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">My Diet Plan</h3>
              <p className="text-sm text-muted-foreground">Current active plan</p>
            </div>
          </div>

          {activeDiet ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold text-foreground mb-1">
                  {activeDiet.diet_plans?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeDiet.diet_plans?.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium capitalize">
                    {activeDiet.diet_plans?.diet_preference}
                  </span>
                  {activeDiet.diet_plans?.total_calories && (
                    <span className="text-xs text-muted-foreground">
                      {activeDiet.diet_plans.total_calories} cal/day
                    </span>
                  )}
                </div>
              </div>
              <a
                href="/user/diet"
                className="block w-full px-4 py-2 bg-green-500 text-white rounded-lg text-center font-medium hover:bg-green-600 transition-colors"
              >
                View Full Plan
              </a>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active diet plan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact your trainer to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* My Trainers */}
      {trainers && trainers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">My Trainers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map((assignment: any) => (
              <div
                key={assignment.id}
                className="p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {assignment.users?.first_name} {assignment.users?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.users?.email}
                    </p>
                    {assignment.users?.phone && (
                      <p className="text-sm text-muted-foreground">
                        {assignment.users.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {recentProgress && recentProgress.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Latest Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Weight</p>
              <p className="text-2xl font-bold text-foreground">
                {recentProgress[0].weight_kg} kg
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">BMI</p>
              <p className="text-2xl font-bold text-foreground">
                {recentProgress[0].bmi}
              </p>
            </div>
            {recentProgress[0].body_fat_percentage && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Body Fat</p>
                <p className="text-2xl font-bold text-foreground">
                  {recentProgress[0].body_fat_percentage}%
                </p>
              </div>
            )}
            {recentProgress[0].muscle_mass_kg && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Muscle Mass</p>
                <p className="text-2xl font-bold text-foreground">
                  {recentProgress[0].muscle_mass_kg} kg
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

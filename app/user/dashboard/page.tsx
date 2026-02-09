import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GradientStatCard } from '@/components/stat-card';
import { 
  User, Dumbbell, Calendar, Activity, TrendingUp, Clock, 
  CheckCircle, Scale, Target, ArrowUp, ArrowDown, Minus,
  ClipboardList
} from 'lucide-react';
import { MemberQuickActions } from '@/components/member-quick-actions';

// Ensure fresh data on every request after revalidation
export const dynamic = 'force-dynamic';

// Calculate attendance streak
function calculateStreak(attendance: any[]): number {
  if (!attendance || attendance.length === 0) return 0;

  const sorted = [...attendance].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const recordDate = new Date(sorted[i].date);
    recordDate.setHours(0, 0, 0, 0);
    
    if (i === 0) {
      const dayDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff > 1) break;
      streak = 1;
    } else {
      const prevDate = new Date(sorted[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((prevDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
}

export default async function UserDashboard() {
  const user = await getCurrentUserData();

  // Fetch all data in parallel
  const [
    profileResult,
    trainersResult,
    workoutResult,
    dietResult,
    attendanceMonthResult,
    attendanceAllResult,
    progressResult,
    membershipResult
  ] = await Promise.all([
    supabaseAdmin.from('user_profiles').select('*').eq('user_id', user?.id).single(),
    supabaseAdmin.from('trainer_assignments').select(`*, users:trainer_id (id, first_name, last_name, email, phone)`).eq('user_id', user?.id).eq('is_active', true),
    supabaseAdmin.from('user_workout_plans').select('*, workout_plans(*)').eq('user_id', user?.id).eq('is_active', true).single(),
    supabaseAdmin.from('user_diet_plans').select('*, diet_plans(*)').eq('user_id', user?.id).eq('is_active', true).single(),
    supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabaseAdmin.from('attendance').select('*').eq('user_id', user?.id).order('date', { ascending: false }).limit(30),
    supabaseAdmin.from('progress_logs').select('*').eq('user_id', user?.id).order('logged_at', { ascending: false }),
    supabaseAdmin.from('user_memberships').select('*').eq('user_id', user?.id).eq('status', 'active').order('end_date', { ascending: false }).limit(1).single()
  ]);

  const profile = profileResult.data;
  const trainers = trainersResult.data;
  const activeWorkout = workoutResult.data;
  const activeDiet = dietResult.data;
  const attendanceCount = attendanceMonthResult.count;
  const attendanceRecords = attendanceAllResult.data || [];
  const progressLogs = progressResult.data || [];
  const activeMembership = membershipResult.data;

  // Calculate stats
  const streak = calculateStreak(attendanceRecords);
  
  let daysRemaining = 0;
  if (activeMembership?.end_date) {
    const end = new Date(activeMembership.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Progress calculations
  const latestLog = progressLogs[0];
  const firstLog = progressLogs[progressLogs.length - 1];
  const weightChange = latestLog && firstLog ? (latestLog.weight_kg - firstLog.weight_kg).toFixed(1) : null;
  const targetWeight = profile?.target_weight_kg;
  const currentWeight = latestLog?.weight_kg || profile?.current_weight_kg;
  const weightToGoal = targetWeight && currentWeight ? (currentWeight - targetWeight).toFixed(1) : null;

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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GradientStatCard
          title="Days Left"
          value={activeMembership ? (daysRemaining > 0 ? `${daysRemaining}` : 'Expired') : 'No Plan'}
          icon={Clock}
          gradient={!activeMembership ? "gradient-warning" : daysRemaining > 7 ? "gradient-success" : "bg-gradient-to-br from-red-500 to-orange-500"}
        />
        <GradientStatCard
          title="This Month"
          value={attendanceCount || 0}
          icon={Calendar}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="Streak"
          value={`${streak} days`}
          icon={CheckCircle}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="Weight"
          value={currentWeight ? `${currentWeight} kg` : 'N/A'}
          icon={Scale}
          gradient="gradient-accent"
        />
      </div>

      {/* Quick Actions - Self Service */}
      <MemberQuickActions 
        profile={profile} 
        currentWeight={profile?.current_weight_kg}
      />

      {/* Progress & Attendance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Progress Summary */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">My Progress</h3>
              <p className="text-sm text-muted-foreground">Your fitness journey</p>
            </div>
          </div>

          {latestLog ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xl font-bold text-foreground">{latestLog.weight_kg} kg</p>
                  <p className="text-xs text-muted-foreground">Current</p>
                </div>
                {targetWeight && (
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xl font-bold text-foreground">{targetWeight} kg</p>
                    <p className="text-xs text-muted-foreground">Target</p>
                  </div>
                )}
              </div>
              
              {weightChange && parseFloat(weightChange) !== 0 && (
                <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Change</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    parseFloat(weightChange) < 0 ? 'text-green-500' : 
                    parseFloat(weightChange) > 0 ? 'text-orange-500' : 'text-foreground'
                  }`}>
                    {parseFloat(weightChange) < 0 ? <ArrowDown className="w-4 h-4" /> : 
                     parseFloat(weightChange) > 0 ? <ArrowUp className="w-4 h-4" /> : 
                     <Minus className="w-4 h-4" />}
                    {Math.abs(parseFloat(weightChange))} kg
                  </span>
                </div>
              )}

              {weightToGoal && (
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{Math.abs(parseFloat(weightToGoal))} kg</p>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(weightToGoal) > 0 ? 'to lose' : parseFloat(weightToGoal) < 0 ? 'to gain' : 'Goal reached! 🎉'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No progress data yet</p>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Attendance</h3>
              <p className="text-sm text-muted-foreground">Recent gym visits</p>
            </div>
          </div>

          {attendanceRecords.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {attendanceRecords.slice(0, 5).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-green-500">
                        {new Date(record.date).getDate()}
                      </span>
                      <span className="text-[10px] text-green-500">
                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                  {record.check_in_time && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No attendance records</p>
            </div>
          )}

          {/* Streak Banner */}
          {streak > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-lg text-center">
              <span className="text-lg mr-2">🔥</span>
              <span className="font-semibold text-foreground">{streak} Day Streak!</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Workout Plan */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">My Workout</h3>
              <p className="text-sm text-muted-foreground">Current active plan</p>
            </div>
          </div>

          {activeWorkout ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold text-foreground mb-1">{activeWorkout.workout_plans?.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{activeWorkout.workout_plans?.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-medium capitalize">
                    {activeWorkout.workout_plans?.difficulty}
                  </span>
                </div>
              </div>
              <a href="/user/workout" className="block w-full px-4 py-2 bg-purple-500 text-white rounded-lg text-center text-sm font-medium hover:bg-purple-600 transition-colors">
                View Plan
              </a>
            </div>
          ) : (
            <div className="text-center py-6">
              <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No active workout plan</p>
            </div>
          )}
        </div>

        {/* Diet Plan */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">My Diet</h3>
              <p className="text-sm text-muted-foreground">Current active plan</p>
            </div>
          </div>

          {activeDiet ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold text-foreground mb-1">{activeDiet.diet_plans?.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{activeDiet.diet_plans?.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium capitalize">
                    {activeDiet.diet_plans?.diet_preference}
                  </span>
                </div>
              </div>
              <a href="/user/diet" className="block w-full px-4 py-2 bg-green-500 text-white rounded-lg text-center text-sm font-medium hover:bg-green-600 transition-colors">
                View Plan
              </a>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No active diet plan</p>
            </div>
          )}
        </div>
      </div>

      {/* My Trainer */}
      {trainers && trainers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">My Trainer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map((assignment: any) => (
              <div key={assignment.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {assignment.users?.first_name} {assignment.users?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{assignment.users?.email}</p>
                    {assignment.users?.phone && (
                      <p className="text-sm text-muted-foreground">{assignment.users.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

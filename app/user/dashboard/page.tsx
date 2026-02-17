import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GradientStatCard } from '@/components/stat-card';
import { 
  User, Dumbbell, Calendar, Activity, TrendingUp, Clock, 
  CheckCircle, Scale, Target, ArrowUp, ArrowDown, Minus,
  ClipboardList, ArrowRight, Flame, Utensils, Zap,
  BarChart3, CalendarCheck, Trophy, Heart
} from 'lucide-react';
import { MemberQuickActions } from '@/components/member-quick-actions';
import Link from 'next/link';

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

function getWeekday(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
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
    membershipResult,
    totalAttendanceResult,
    lastMonthAttendanceResult,
  ] = await Promise.all([
    supabaseAdmin.from('user_profiles').select('*').eq('user_id', user?.id).single(),
    supabaseAdmin.from('trainer_assignments').select(`*, users:trainer_id (id, first_name, last_name, email, phone)`).eq('user_id', user?.id).eq('is_active', true),
    supabaseAdmin.from('user_workout_plans').select('*, workout_plans(*)').eq('user_id', user?.id).eq('is_active', true).single(),
    supabaseAdmin.from('user_diet_plans').select('*, diet_plans(*)').eq('user_id', user?.id).eq('is_active', true).single(),
    supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabaseAdmin.from('attendance').select('*').eq('user_id', user?.id).order('date', { ascending: false }).limit(60),
    supabaseAdmin.from('progress_logs').select('*').eq('user_id', user?.id).order('logged_at', { ascending: false }),
    supabaseAdmin.from('user_memberships').select('*').eq('user_id', user?.id).eq('status', 'active').order('end_date', { ascending: false }).limit(1).single(),
    supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
    supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user?.id)
      .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .lt('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ]);

  const profile = profileResult.data;
  const trainers = trainersResult.data;
  const activeWorkout = workoutResult.data;
  const activeDiet = dietResult.data;
  const attendanceCount = attendanceMonthResult.count || 0;
  const attendanceRecords = attendanceAllResult.data || [];
  const progressLogs = progressResult.data || [];
  const activeMembership = membershipResult.data;
  const totalAttendance = totalAttendanceResult.count || 0;
  const lastMonthAttendance = lastMonthAttendanceResult.count || 0;

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

  // Attendance comparison
  const attendanceDiff = attendanceCount - lastMonthAttendance;
  const attendanceTrend = lastMonthAttendance > 0 
    ? ((attendanceDiff / lastMonthAttendance) * 100).toFixed(0) 
    : attendanceCount > 0 ? '+100' : '0';

  // Weekly attendance for mini chart (last 4 weeks)
  const weeklyData: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(Date.now() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(Date.now() - w * 7 * 24 * 60 * 60 * 1000);
    const count = attendanceRecords.filter((r: any) => {
      const d = new Date(r.date);
      return d >= weekStart && d < weekEnd;
    }).length;
    weeklyData.push(count);
  }
  const maxWeekly = Math.max(...weeklyData, 1);

  // Progress data for mini chart (last 5 logs)
  const recentProgress = progressLogs.slice(0, 5).reverse();
  const progressWeights = recentProgress.map((l: any) => l.weight_kg);
  const minWeight = Math.min(...progressWeights, 0);
  const maxWeight = Math.max(...progressWeights, 1);

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Welcome back, {user?.first_name || 'Member'}! 🔥
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Here's your fitness overview at a glance.
        </p>
      </div>

      {/* ─── Top Stat Cards (4 cards like the reference) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Membership Days */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Membership</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
            {activeMembership ? (daysRemaining > 0 ? daysRemaining : 0) : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeMembership 
              ? (daysRemaining > 0 ? 'days remaining' : 'Expired — Renew now')
              : 'No active plan'
            }
          </p>
          {activeMembership && daysRemaining > 0 && (
            <div className="mt-3 w-full bg-muted rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${daysRemaining > 30 ? 'bg-emerald-500' : daysRemaining > 7 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min((daysRemaining / 365) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Attendance This Month */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">This Month</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{attendanceCount}</p>
            <span className={`text-xs font-semibold ${Number(attendanceTrend) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {Number(attendanceTrend) >= 0 ? '+' : ''}{attendanceTrend}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">days attended</p>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1 mt-3 h-8">
            {weeklyData.map((val, i) => (
              <div 
                key={i}
                className="flex-1 bg-primary/20 rounded-sm transition-all group-hover:bg-primary/30"
                style={{ height: `${(val / maxWeekly) * 100}%`, minHeight: '4px' }}
              >
                <div 
                  className="w-full bg-primary rounded-sm transition-all"
                  style={{ height: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{streak}</p>
          <p className="text-xs text-muted-foreground mt-1">consecutive days</p>
          {streak > 0 && (
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full" />
              ))}
              {streak > 7 && <span className="text-xs text-muted-foreground ml-1">+{streak - 7}</span>}
            </div>
          )}
        </div>

        {/* Current Weight */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Weight</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              {currentWeight ? `${currentWeight}` : '—'}
            </p>
            {currentWeight && <span className="text-sm text-muted-foreground">kg</span>}
            {weightChange && parseFloat(weightChange) !== 0 && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${parseFloat(weightChange) < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {parseFloat(weightChange) < 0 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                {Math.abs(parseFloat(weightChange))}kg
              </span>
            )}
          </div>
          {targetWeight && (
            <p className="text-xs text-muted-foreground mt-1">
              Target: {targetWeight} kg
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions - Self Service */}
      <MemberQuickActions 
        profile={profile} 
        currentWeight={profile?.current_weight_kg}
      />

      {/* ─── Middle Row: Progress + Attendance ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        
        {/* Progress Summary (larger, 3 cols) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Progress Tracker</h3>
                <p className="text-xs text-muted-foreground">Weight journey overview</p>
              </div>
            </div>
            <Link href="/user/progress" className="text-xs text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>

          {progressLogs.length > 0 ? (
            <div className="space-y-4">
              {/* Weight overview cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/40 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground mb-1">Start</p>
                  <p className="text-lg font-bold text-foreground">{firstLog?.weight_kg || '—'}</p>
                  <p className="text-[10px] text-muted-foreground">kg</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl text-center border border-primary/20">
                  <p className="text-xs text-primary mb-1">Current</p>
                  <p className="text-lg font-bold text-foreground">{latestLog?.weight_kg || '—'}</p>
                  <p className="text-[10px] text-muted-foreground">kg</p>
                </div>
                {targetWeight && (
                  <div className="p-3 bg-muted/40 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1">Goal</p>
                    <p className="text-lg font-bold text-foreground">{targetWeight}</p>
                    <p className="text-[10px] text-muted-foreground">kg</p>
                  </div>
                )}
              </div>

              {/* Weight change banner */}
              {weightChange && parseFloat(weightChange) !== 0 && (
                <div className={`p-3 rounded-xl flex items-center justify-between ${
                  parseFloat(weightChange) < 0 
                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                    : 'bg-orange-500/10 border border-orange-500/20'
                }`}>
                  <span className="text-sm text-muted-foreground">Total Change</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    parseFloat(weightChange) < 0 ? 'text-emerald-500' : 'text-orange-500'
                  }`}>
                    {parseFloat(weightChange) < 0 ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                    {Math.abs(parseFloat(weightChange))} kg
                  </span>
                </div>
              )}

              {/* Goal progress bar */}
              {weightToGoal && targetWeight && currentWeight && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Goal Progress</span>
                    <span className="font-semibold text-foreground">
                      {parseFloat(weightToGoal) === 0 
                        ? '🎉 Goal reached!' 
                        : `${Math.abs(parseFloat(weightToGoal))} kg to ${parseFloat(weightToGoal) > 0 ? 'lose' : 'gain'}`
                      }
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
                      style={{ 
                        width: `${Math.min(
                          Math.max(
                            ((Math.abs(parseFloat(weightChange || '0')) / Math.max(Math.abs(firstLog?.weight_kg - targetWeight), 1)) * 100),
                            5
                          ),
                          100
                        )}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Recent progress logs */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Logs</p>
                {progressLogs.slice(0, 4).map((log: any, i: number) => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {new Date(log.logged_at).getDate()}
                        </span>
                        <span className="text-[8px] text-primary">
                          {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{log.weight_kg} kg</span>
                    </div>
                    {i < progressLogs.length - 1 && (
                      <span className={`text-xs font-semibold ${
                        log.weight_kg < progressLogs[i + 1]?.weight_kg ? 'text-emerald-500' : 
                        log.weight_kg > progressLogs[i + 1]?.weight_kg ? 'text-orange-500' : 'text-muted-foreground'
                      }`}>
                        {log.weight_kg < progressLogs[i + 1]?.weight_kg ? '↓' : log.weight_kg > progressLogs[i + 1]?.weight_kg ? '↑' : '='}
                        {' '}{Math.abs(log.weight_kg - (progressLogs[i + 1]?.weight_kg || log.weight_kg)).toFixed(1)}kg
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No progress data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Log your weight to start tracking</p>
            </div>
          )}
        </div>

        {/* Attendance Summary (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Attendance</h3>
                <p className="text-xs text-muted-foreground">Your gym visits</p>
              </div>
            </div>
            <Link href="/user/attendance" className="text-xs text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>

          {/* Attendance stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-center">
              <p className="text-2xl font-bold text-foreground">{attendanceCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Month</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <p className="text-2xl font-bold text-foreground">{totalAttendance}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">All Time</p>
            </div>
          </div>

          {/* Streak banner */}
          {streak > 0 && (
            <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl text-center mb-4">
              <span className="text-lg mr-1">🔥</span>
              <span className="font-bold text-foreground">{streak} Day Streak!</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Keep it going!</p>
            </div>
          )}

          {/* Recent visits */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Visits</p>
            {attendanceRecords.length > 0 ? (
              attendanceRecords.slice(0, 6).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-emerald-500">
                        {new Date(record.date).getDate()}
                      </span>
                      <span className="text-[8px] text-emerald-500">
                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">
                      {getWeekday(new Date(record.date))}
                    </span>
                  </div>
                  {record.check_in_time && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {new Date(record.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CalendarCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No visits yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Active Plans ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Workout Plan */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">My Workout</h3>
                <p className="text-xs text-muted-foreground">Active plan</p>
              </div>
            </div>
            <Link href="/user/workout/library" className="text-xs text-primary hover:underline font-medium">
              Browse →
            </Link>
          </div>

          {activeWorkout ? (
            <div className="space-y-3 flex-1">
              <div className="p-4 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/10 rounded-xl">
                <p className="font-bold text-foreground text-lg mb-1">{activeWorkout.workout_plans?.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{activeWorkout.workout_plans?.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-purple-500/15 text-purple-500 rounded-lg text-xs font-semibold capitalize">
                    {activeWorkout.workout_plans?.difficulty}
                  </span>
                  {activeWorkout.workout_plans?.duration_weeks && (
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {activeWorkout.workout_plans?.duration_weeks} weeks
                    </span>
                  )}
                </div>
              </div>
              <Link 
                href="/user/workout"
                className="block w-full px-4 py-2.5 bg-purple-500 text-white rounded-xl text-center text-sm font-semibold hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20"
              >
                View Plan →
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-3">
                <Dumbbell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No active workout</p>
              <Link href="/user/workout/library" className="text-xs text-primary hover:underline mt-2">
                Browse workout plans →
              </Link>
            </div>
          )}
        </div>

        {/* Active Diet Plan */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">My Diet</h3>
                <p className="text-xs text-muted-foreground">Active plan</p>
              </div>
            </div>
            <Link href="/user/diet/library" className="text-xs text-primary hover:underline font-medium">
              Browse →
            </Link>
          </div>

          {activeDiet ? (
            <div className="space-y-3 flex-1">
              <div className="p-4 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 rounded-xl">
                <p className="font-bold text-foreground text-lg mb-1">{activeDiet.diet_plans?.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{activeDiet.diet_plans?.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-500 rounded-lg text-xs font-semibold capitalize">
                    {activeDiet.diet_plans?.diet_preference?.replace('_', ' ')}
                  </span>
                  {activeDiet.diet_plans?.total_calories && (
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {activeDiet.diet_plans?.total_calories} kcal
                    </span>
                  )}
                </div>
              </div>
              {/* Macro breakdown */}
              {activeDiet.diet_plans?.protein_grams && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-center">
                    <p className="text-xs text-blue-500 font-semibold">Protein</p>
                    <p className="text-sm font-bold text-foreground">{activeDiet.diet_plans.protein_grams}g</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-center">
                    <p className="text-xs text-amber-500 font-semibold">Carbs</p>
                    <p className="text-sm font-bold text-foreground">{activeDiet.diet_plans.carbs_grams}g</p>
                  </div>
                  <div className="p-2 bg-rose-500/10 rounded-lg text-center">
                    <p className="text-xs text-rose-500 font-semibold">Fats</p>
                    <p className="text-sm font-bold text-foreground">{activeDiet.diet_plans.fat_grams}g</p>
                  </div>
                </div>
              )}
              <Link 
                href="/user/diet"
                className="block w-full px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-center text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                View Plan →
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-3">
                <Utensils className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No active diet</p>
              <Link href="/user/diet/library" className="text-xs text-primary hover:underline mt-2">
                Browse diet plans →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── My Trainer ─── */}
      {trainers && trainers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">My Trainer</h3>
              <p className="text-xs text-muted-foreground">Your assigned coach</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainers.map((assignment: any) => (
              <div key={assignment.id} className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {assignment.users?.first_name} {assignment.users?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{assignment.users?.email}</p>
                    {assignment.users?.phone && (
                      <p className="text-xs text-muted-foreground">{assignment.users.phone}</p>
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

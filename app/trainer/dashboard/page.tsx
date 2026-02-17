import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GradientStatCard } from '@/components/stat-card';
import { 
  Users, Dumbbell, Calendar, Activity, TrendingUp, Clock,
  CheckCircle, Target, ArrowRight, Utensils, Flame,
  CalendarCheck, User, BarChart3, Award, UserCheck,
  ClipboardList, Eye, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TrainerDashboard() {
  const user = await getCurrentUserData();

  // Fetch assigned members with details
  const { data: assignedMembers } = await supabaseAdmin
    .from('trainer_assignments')
    .select(`
      *,
      users:user_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        is_active
      )
    `)
    .eq('trainer_id', user?.id)
    .eq('is_active', true);

  const memberIds = assignedMembers?.map(a => a.user_id) || [];
  const dummyIds = ['00000000-0000-0000-0000-000000000000'];
  const queryIds = memberIds.length > 0 ? memberIds : dummyIds;

  // Fetch all stats in parallel
  const [
    { count: totalWorkoutAssignments },
    { count: totalDietAssignments },
    { data: todayAttendance },
    { data: recentAttendance },
    { count: totalWorkoutPlans },
    { count: totalDietPlans },
    { data: memberProfiles },
    { data: recentProgress },
    { data: weeklyAttendance },
  ] = await Promise.all([
    supabaseAdmin
      .from('user_workout_plans')
      .select('*', { count: 'exact', head: true })
      .in('user_id', queryIds)
      .eq('is_active', true),
    supabaseAdmin
      .from('user_diet_plans')
      .select('*', { count: 'exact', head: true })
      .in('user_id', queryIds)
      .eq('is_active', true),
    supabaseAdmin
      .from('attendance')
      .select('*, users(first_name, last_name)')
      .in('user_id', queryIds)
      .gte('check_in_time', new Date().toISOString().split('T')[0])
      .order('check_in_time', { ascending: false }),
    supabaseAdmin
      .from('attendance')
      .select('*, users(first_name, last_name)')
      .in('user_id', queryIds)
      .order('check_in_time', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('workout_plans')
      .select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('diet_plans')
      .select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('user_profiles')
      .select('*, users!inner(id, first_name, last_name)')
      .in('user_id', queryIds),
    supabaseAdmin
      .from('progress_logs')
      .select('*, users!inner(first_name, last_name)')
      .in('user_id', queryIds)
      .order('logged_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('attendance')
      .select('date, user_id')
      .in('user_id', queryIds)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ]);

  // Compute weekly attendance counts per day
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyAttendanceCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dailyAttendanceCounts[key] = 0;
  }
  (weeklyAttendance || []).forEach((a: any) => {
    if (dailyAttendanceCounts[a.date] !== undefined) {
      dailyAttendanceCounts[a.date]++;
    }
  });
  const dailyEntries = Object.entries(dailyAttendanceCounts).map(([date, count]) => ({
    day: weekDays[new Date(date).getDay()],
    count,
    date,
  }));
  const maxDailyAttendance = Math.max(...dailyEntries.map(e => e.count), 1);

  // Members with active workout/diet plans
  const memberCount = assignedMembers?.length || 0;
  const presentToday = todayAttendance?.length || 0;
  const absentToday = memberCount - presentToday;

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Welcome back, {user?.first_name || 'Trainer'}! 💪
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Here's how your members are doing today.
        </p>
      </div>

      {/* ─── Top Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* My Members */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">My Members</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{memberCount}</p>
          <p className="text-xs text-muted-foreground mt-1">assigned to me</p>
          {/* Active indicator dots */}
          {memberCount > 0 && (
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: Math.min(memberCount, 8) }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-gradient-to-br from-primary to-blue-500 rounded-full" />
              ))}
              {memberCount > 8 && <span className="text-xs text-muted-foreground ml-1">+{memberCount - 8}</span>}
            </div>
          )}
        </div>

        {/* Present Today */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Present Today</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{presentToday}</p>
            <span className="text-xs text-muted-foreground">/ {memberCount}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">members checked in</p>
          {/* Attendance ratio bar */}
          {memberCount > 0 && (
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                style={{ width: `${(presentToday / memberCount) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Active Workouts */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Active Workouts</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{totalWorkoutAssignments || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">plans assigned</p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{totalWorkoutPlans || 0} plans available</span>
          </div>
        </div>

        {/* Active Diets */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Active Diets</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{totalDietAssignments || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">plans assigned</p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{totalDietPlans || 0} plans available</span>
          </div>
        </div>
      </div>

      {/* ─── Middle Row: Weekly Chart + Today's Attendance ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Weekly Attendance Chart (3 cols) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Weekly Attendance</h3>
                <p className="text-xs text-muted-foreground">Member check-ins this week</p>
              </div>
            </div>
            <Link href="/trainer/attendance" className="text-xs text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-56 px-2">
            {dailyEntries.map((entry, i) => {
              const isToday = entry.date === new Date().toISOString().split('T')[0];
              return (
                <div key={entry.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-foreground tabular-nums">{entry.count}</span>
                  <div className="w-full flex-1 flex items-end">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 ${
                        isToday 
                          ? 'bg-gradient-to-t from-primary to-primary/70' 
                          : 'bg-gradient-to-t from-primary/40 to-primary/20'
                      }`}
                      style={{ 
                        height: `${Math.max((entry.count / maxDailyAttendance) * 100, 6)}%`,
                        minHeight: '8px'
                      }}
                    />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {entry.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary stats below chart */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{(weeklyAttendance || []).length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{presentToday}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Today</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {memberCount > 0 ? Math.round((presentToday / memberCount) * 100) : 0}%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rate</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance List (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Today's Activity</h3>
                <p className="text-xs text-muted-foreground">Who's in the gym</p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold">
              {presentToday} Present
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px]">
            {todayAttendance && todayAttendance.length > 0 ? (
              todayAttendance.map((attendance: any) => (
                <div
                  key={attendance.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {attendance.users?.first_name} {attendance.users?.last_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Checked in at {new Date(attendance.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mb-3">
                  <Activity className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No check-ins today</p>
                <p className="text-xs text-muted-foreground mt-1">Members haven't arrived yet</p>
              </div>
            )}
          </div>

          {/* Absent members */}
          {absentToday > 0 && memberCount > 0 && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl text-center">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {absentToday} member{absentToday > 1 ? 's' : ''} haven't checked in yet
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Row: Members + Recent Progress ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Assigned Members Table (3 cols) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">My Members</h3>
                <p className="text-xs text-muted-foreground">{memberCount} assigned members</p>
              </div>
            </div>
            <Link href="/trainer/members" className="text-xs text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>

          {assignedMembers && assignedMembers.length > 0 ? (
            <div className="space-y-2">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-5">Member</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Action</div>
              </div>
              
              {assignedMembers.slice(0, 6).map((assignment: any) => {
                const isPresent = todayAttendance?.some((a: any) => a.user_id === assignment.user_id);
                return (
                  <div 
                    key={assignment.id} 
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    {/* Name */}
                    <div className="sm:col-span-5 flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-sm text-foreground truncate">
                        {assignment.users?.first_name} {assignment.users?.last_name}
                      </span>
                    </div>
                    {/* Email */}
                    <div className="sm:col-span-3 hidden sm:block">
                      <span className="text-xs text-muted-foreground truncate block">{assignment.users?.email}</span>
                    </div>
                    {/* Status */}
                    <div className="sm:col-span-2 flex justify-start sm:justify-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        isPresent
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                    </div>
                    {/* Action */}
                    <div className="sm:col-span-2 flex justify-start sm:justify-center">
                      <Link
                        href={`/trainer/members/${assignment.user_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}

              {memberCount > 6 && (
                <Link 
                  href="/trainer/members"
                  className="block text-center text-xs text-primary hover:underline font-medium py-2"
                >
                  View all {memberCount} members →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No members assigned yet</p>
              <p className="text-xs text-muted-foreground mt-1">Contact your admin to get members assigned</p>
            </div>
          )}
        </div>

        {/* Recent Activity / Progress (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 sm:p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Member progress updates</p>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px]">
            {recentProgress && recentProgress.length > 0 ? (
              recentProgress.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {log.users?.first_name} {log.users?.last_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Logged {log.weight_kg}kg • {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{log.weight_kg}</p>
                    <p className="text-[10px] text-muted-foreground">kg</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mb-3">
                  <TrendingUp className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No progress data</p>
                <p className="text-xs text-muted-foreground mt-1">Members haven't logged progress yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <QuickActionCard
          title="My Members"
          href="/trainer/members"
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-indigo-500"
        />
        <QuickActionCard
          title="Workout Plans"
          href="/trainer/workouts"
          icon={Dumbbell}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
        />
        <QuickActionCard
          title="Diet Plans"
          href="/trainer/diets"
          icon={Utensils}
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
        <QuickActionCard
          title="Attendance"
          href="/trainer/attendance"
          icon={CalendarCheck}
          color="bg-gradient-to-br from-orange-500 to-red-500"
        />
      </div>
    </div>
  );
}

function QuickActionCard({ 
  title, 
  href, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  href: string; 
  icon: any; 
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group p-4 sm:p-5 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 group-hover:text-primary transition-colors">
        View <ChevronRight className="w-3 h-3" />
      </p>
    </Link>
  );
}

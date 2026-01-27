import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { StatCard, GradientStatCard } from '@/components/stat-card';
import { Users, Dumbbell, Calendar, Activity } from 'lucide-react';

export default async function TrainerDashboard() {
  const user = await getCurrentUserData();

  // Fetch assigned members
  const { data: assignedMembers } = await supabaseAdmin
    .from('trainer_assignments')
    .select(`
      *,
      users:user_id (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq('trainer_id', user?.id)
    .eq('is_active', true);

  const memberIds = assignedMembers?.map(a => a.user_id) || [];

  // Fetch statistics for assigned members
  const [
    { count: totalWorkouts },
    { count: totalDiets },
    { data: todayAttendance }
  ] = await Promise.all([
    supabaseAdmin
      .from('user_workout_plans')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']),
    supabaseAdmin
      .from('user_diet_plans')
      .select('*', { count: 'exact', head: true })
      .in('user_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']),
    supabaseAdmin
      .from('attendance')
      .select('*, users(first_name, last_name)')
      .in('user_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000'])
      .gte('check_in_time', new Date().toISOString().split('T')[0])
      .order('check_in_time', { ascending: false })
  ]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Welcome back, {user?.first_name || 'Trainer'}! 💪
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Track and manage your assigned members.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <GradientStatCard
          title="My Members"
          value={assignedMembers?.length || 0}
          icon={Users}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="Active Workouts"
          value={totalWorkouts || 0}
          icon={Dumbbell}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="Active Diets"
          value={totalDiets || 0}
          icon={Calendar}
          gradient="gradient-accent"
        />
        <GradientStatCard
          title="Present Today"
          value={todayAttendance?.length || 0}
          icon={Activity}
          gradient="gradient-success"
        />
      </div>

      {/* Assigned Members */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">My Assigned Members</h2>
        
        {assignedMembers && assignedMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedMembers.map((assignment: any) => (
              <div
                key={assignment.id}
                className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors card-hover"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {assignment.users?.first_name} {assignment.users?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.users?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/trainer/members/${assignment.user_id}`}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium text-center hover:bg-primary/90 transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No members assigned yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact your admin to get members assigned
            </p>
          </div>
        )}
      </div>

      {/* Today's Attendance */}
      {todayAttendance && todayAttendance.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Today's Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAttendance.map((attendance: any) => (
              <div
                key={attendance.id}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {attendance.users?.first_name} {attendance.users?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(attendance.check_in_time).toLocaleTimeString()}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

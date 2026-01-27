import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { StatCard, GradientStatCard } from '@/components/stat-card';
import { Users, UserCog, Dumbbell, TrendingUp, Calendar, Activity } from 'lucide-react';

export default async function SuperuserDashboard() {
  const user = await getCurrentUserData();

  // Fetch statistics
  const [
    { count: totalMembers },
    { count: totalAdmins },
    { count: totalTrainers },
    { count: totalWorkouts },
    { count: totalDiets },
    { data: recentAttendance }
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'trainer'),
    supabaseAdmin.from('workout_plans').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('diet_plans').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('attendance')
      .select('*, users(first_name, last_name)')
      .order('check_in_time', { ascending: false })
      .limit(5)
  ]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Welcome back, {user?.first_name || 'Superuser'}! 👑
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
          Here's what's happening in your gym today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <GradientStatCard
          title="Total Members"
          value={totalMembers || 0}
          icon={Users}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="Total Trainers"
          value={totalTrainers || 0}
          icon={UserCog}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="Total Admins"
          value={totalAdmins || 0}
          icon={Activity}
          gradient="gradient-accent"
        />
        <GradientStatCard
          title="Workout Plans"
          value={totalWorkouts || 0}
          icon={Dumbbell}
          gradient="gradient-warning"
        />
        <GradientStatCard
          title="Diet Plans"
          value={totalDiets || 0}
          icon={Calendar}
          gradient="gradient-success"
        />
        <GradientStatCard
          title="Active Today"
          value={recentAttendance?.length || 0}
          icon={TrendingUp}
          gradient="gradient-info"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Check-ins</h2>
        
        {recentAttendance && recentAttendance.length > 0 ? (
          <div className="space-y-4">
            {recentAttendance.map((attendance: any) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {attendance.users?.first_name} {attendance.users?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(attendance.check_in_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                  Checked In
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent check-ins</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Add Admin"
          href="/superuser/admins"
          icon={UserCog}
          color="bg-blue-500"
        />
        <QuickActionCard
          title="Add Trainer"
          href="/superuser/trainers"
          icon={Users}
          color="bg-purple-500"
        />
        <QuickActionCard
          title="Add Member"
          href="/superuser/members"
          icon={Users}
          color="bg-green-500"
        />
        <QuickActionCard
          title="View Analytics"
          href="/superuser/analytics"
          icon={TrendingUp}
          color="bg-orange-500"
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
    <a
      href={href}
      className="group p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300 card-hover"
    >
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </a>
  );
}

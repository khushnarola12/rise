import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { StatCard, GradientStatCard } from '@/components/stat-card';
import { Users, UserCog, Dumbbell, Calendar, TrendingUp, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const user = await getCurrentUserData();

  // Fetch gym-specific statistics
  const [
    { count: totalMembers },
    { count: totalTrainers },
    { count: totalWorkouts },
    { count: totalDiets },
    { data: todayAttendance },
    { data: gymData }
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('gym_id', user?.gym_id),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'trainer').eq('gym_id', user?.gym_id),
    supabaseAdmin.from('workout_plans').select('*', { count: 'exact', head: true }).eq('gym_id', user?.gym_id),
    supabaseAdmin.from('diet_plans').select('*', { count: 'exact', head: true }).eq('gym_id', user?.gym_id),
    supabaseAdmin
      .from('attendance')
      .select('*, users(first_name, last_name)')
      .eq('gym_id', user?.gym_id)
      .gte('check_in_time', new Date().toISOString().split('T')[0])
      .order('check_in_time', { ascending: false }),
    supabaseAdmin
      .from('gyms')
      .select('subscription_expires_at')
      .eq('id', user?.gym_id)
      .single()
  ]);

  // Calculate days remaining
  let daysRemaining = 0;
  if (gymData?.subscription_expires_at) {
    const expires = new Date(gymData.subscription_expires_at);
    const now = new Date();
    const diffTime = expires.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    // If no expiration set, assume infinite or trial? 
    // For now, if null, we might show "Trial" or handle gracefuly.
    // Let's assume infinite if null (legacy gyms)
    daysRemaining = 365; // Fallback or handle differently
  }
  
  // Format display
  const isExpired = daysRemaining <= 0;
  const daysDisplay = isExpired ? 'Expired' : `${daysRemaining} Days`;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          Welcome back, {user?.first_name || 'Admin'}! 🎯
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
          Manage your gym efficiently from this dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <GradientStatCard
          title="Subscription"
          value={daysDisplay}
          icon={Calendar}
          gradient={isExpired ? "from-red-500 to-red-600" : (daysRemaining < 30 ? "from-orange-500 to-red-500" : "from-emerald-500 to-teal-500")}
        />
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
          title="Workout Plans"
          value={totalWorkouts || 0}
          icon={Dumbbell}
          gradient="gradient-accent"
        />
      </div>

      {/* Today's Attendance */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Today's Attendance</h2>
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-lg font-semibold text-sm sm:text-base">
            {todayAttendance?.length || 0} Present
          </div>
        </div>
        
        {todayAttendance && todayAttendance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {todayAttendance.map((attendance: any) => (
              <div
                key={attendance.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base truncate">
                    {attendance.users?.first_name} {attendance.users?.last_name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {new Date(attendance.check_in_time).toLocaleTimeString()}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No attendance recorded today</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <QuickActionCard
          title="Add Trainer"
          href="/admin/trainers"
          icon={UserCog}
          color="bg-purple-500"
        />
        <QuickActionCard
          title="Add Member"
          href="/admin/members"
          icon={Users}
          color="bg-blue-500"
        />
        <QuickActionCard
          title="Mark Attendance"
          href="/admin/attendance"
          icon={Activity}
          color="bg-green-500"
        />
        <QuickActionCard
          title="View Analytics"
          href="/admin/analytics"
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
      className="group p-4 sm:p-5 md:p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300 card-hover"
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
    </a>
  );
}

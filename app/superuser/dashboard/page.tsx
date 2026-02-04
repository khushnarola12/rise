import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getRevenuePerAdmin } from '@/lib/settings';
import { 
  Users, 
  UserCog, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Activity,
  BarChart3,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { RevenueCard } from '@/components/revenue-card';

export default async function SuperuserDashboard() {
  const [user, revenuePerAdmin] = await Promise.all([
    getCurrentUserData(),
    getRevenuePerAdmin()
  ]);

  const [
    { count: totalMembers },
    { count: totalAdmins },
    { count: activeAdmins },
    { count: totalTrainers },
    { count: totalWorkouts },
    { count: totalDiets },
    { data: recentAttendance }
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin').eq('is_active', true),
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
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.first_name || 'Superuser'}! 👑
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening across your platform.
        </p>
      </div>

      {/* Revenue Card - Editable */}
      <RevenueCard 
        totalAdmins={totalAdmins || 0}
        activeAdmins={activeAdmins || 0}
        revenuePerAdmin={revenuePerAdmin} 
        editable={true}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <BigStatCard 
          title="Members" 
          value={totalMembers || 0} 
          icon={Users}
          gradient="from-purple-500 to-purple-600"
        />
        <BigStatCard 
          title="Trainers" 
          value={totalTrainers || 0} 
          icon={Activity}
          gradient="from-blue-500 to-blue-600"
        />
        <BigStatCard 
          title="Admins" 
          value={totalAdmins || 0} 
          icon={UserCog}
          gradient="from-orange-500 to-orange-600"
        />
        <BigStatCard 
          title="Workouts" 
          value={totalWorkouts || 0} 
          icon={Dumbbell}
          gradient="from-pink-500 to-pink-600"
        />
        <BigStatCard 
          title="Diet Plans" 
          value={totalDiets || 0} 
          icon={Calendar}
          gradient="from-green-500 to-green-600"
        />
        <BigStatCard 
          title="Active Today" 
          value={recentAttendance?.length || 0} 
          icon={TrendingUp}
          gradient="from-cyan-500 to-cyan-600"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Check-ins */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Recent Check-ins</h2>
          </div>
          
          <div className="p-6">
            {recentAttendance && recentAttendance.length > 0 ? (
              <div className="space-y-4">
                {recentAttendance.map((attendance: any) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {attendance.users?.first_name?.[0] || '?'}
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
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                      Checked In
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No recent check-ins</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
          
          <Link
            href="/superuser/admins/new"
            className="block p-6 bg-violet-500 rounded-2xl text-white hover:bg-violet-600 transition-colors"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg">Add Admin</h4>
            <p className="text-violet-100 text-sm mt-1">Create new administrator</p>
          </Link>

          <Link
            href="/superuser/analytics"
            className="block p-6 bg-blue-500 rounded-2xl text-white hover:bg-blue-600 transition-colors"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg">View Analytics</h4>
            <p className="text-blue-100 text-sm mt-1">Platform insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BigStatCard({ 
  title, 
  value, 
  icon: Icon,
  gradient
}: { 
  title: string; 
  value: number; 
  icon: any;
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white`}>
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-white/80">{title}</p>
    </div>
  );
}

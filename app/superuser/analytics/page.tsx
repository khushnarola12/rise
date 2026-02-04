import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getRevenuePerAdmin } from '@/lib/settings';
import { 
  Building2, 
  Users, 
  UserCog, 
  Dumbbell,
  TrendingUp,
  Utensils
} from 'lucide-react';
import { RevenueCard } from '@/components/revenue-card';

async function getSystemStats() {
  const [
    gymsResult,
    adminsResult,
    activeAdminsResult,
    trainersResult,
    membersResult,
    workoutPlansResult,
    dietPlansResult
  ] = await Promise.all([
    supabaseAdmin.from('gyms').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin').eq('is_active', true),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'trainer'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabaseAdmin.from('workout_plans').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('diet_plans').select('*', { count: 'exact', head: true })
  ]);

  return {
    totalGyms: gymsResult.count || 0,
    totalAdmins: adminsResult.count || 0,
    activeAdmins: activeAdminsResult.count || 0,
    totalTrainers: trainersResult.count || 0,
    totalMembers: membersResult.count || 0,
    totalWorkoutPlans: workoutPlansResult.count || 0,
    totalDietPlans: dietPlansResult.count || 0
  };
}

async function getGymsList() {
  const { data: gyms } = await supabaseAdmin
    .from('gyms')
    .select('id, name, email, phone, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  const gymsWithStats = await Promise.all(
    (gyms || []).map(async (gym) => {
      const { count: memberCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .eq('role', 'user');
      
      const { count: trainerCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .eq('role', 'trainer');

      return {
        ...gym,
        memberCount: memberCount || 0,
        trainerCount: trainerCount || 0
      };
    })
  );

  return gymsWithStats;
}

export default async function SuperuserAnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform overview and statistics</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

async function AnalyticsContent() {
  const [stats, gyms, revenuePerAdmin] = await Promise.all([
    getSystemStats(),
    getGymsList(),
    getRevenuePerAdmin()
  ]);

  return (
    <div className="space-y-8">
      {/* Revenue Card */}
      <RevenueCard 
        totalAdmins={stats.totalAdmins}
        activeAdmins={stats.activeAdmins}
        revenuePerAdmin={revenuePerAdmin} 
        editable={true}
      />

      {/* Stats Grid - Bigger Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <BigStatCard 
          title="Total Gyms" 
          value={stats.totalGyms} 
          icon={Building2}
          gradient="from-blue-500 to-blue-600"
        />
        <BigStatCard 
          title="Admins" 
          value={stats.totalAdmins} 
          icon={UserCog}
          gradient="from-orange-500 to-orange-600"
        />
        <BigStatCard 
          title="Trainers" 
          value={stats.totalTrainers} 
          icon={TrendingUp}
          gradient="from-purple-500 to-purple-600"
        />
        <BigStatCard 
          title="Members" 
          value={stats.totalMembers} 
          icon={Users}
          gradient="from-pink-500 to-pink-600"
        />
        <BigStatCard 
          title="Workout Plans" 
          value={stats.totalWorkoutPlans} 
          icon={Dumbbell}
          gradient="from-cyan-500 to-cyan-600"
        />
        <BigStatCard 
          title="Diet Plans" 
          value={stats.totalDietPlans} 
          icon={Utensils}
          gradient="from-green-500 to-green-600"
        />
      </div>

      {/* Gyms Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Registered Gyms</h2>
          <p className="text-sm text-muted-foreground mt-1">{gyms.length} gyms total</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Gym</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Members</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Trainers</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {gyms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No gyms registered yet
                  </td>
                </tr>
              ) : (
                gyms.map((gym) => (
                  <tr key={gym.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {gym.name[0]}
                        </div>
                        <span className="font-medium text-foreground">{gym.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      <div>{gym.email || '—'}</div>
                      <div>{gym.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
                        {gym.memberCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-violet-500/10 text-violet-500 rounded-full text-sm font-medium">
                        {gym.trainerCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(gym.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-40 bg-muted/30 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 bg-muted/30 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

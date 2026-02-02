import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { 
  Building2, 
  Users, 
  UserCog, 
  Dumbbell,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { GradientStatCard } from '@/components/stat-card';

async function getSystemStats() {
  const [
    gymsResult,
    adminsResult,
    trainersResult,
    membersResult,
    workoutPlansResult,
    dietPlansResult
  ] = await Promise.all([
    supabaseAdmin.from('gyms').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'trainer'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabaseAdmin.from('workout_plans').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('diet_plans').select('*', { count: 'exact', head: true })
  ]);

  return {
    totalGyms: gymsResult.count || 0,
    totalAdmins: adminsResult.count || 0,
    totalTrainers: trainersResult.count || 0,
    totalMembers: membersResult.count || 0,
    totalWorkoutPlans: workoutPlansResult.count || 0,
    totalDietPlans: dietPlansResult.count || 0
  };
}

async function getGymsList() {
  const { data: gyms } = await supabaseAdmin
    .from('gyms')
    .select(`
      id,
      name,
      email,
      phone,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get member counts for each gym
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">System Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Overview of all gyms and users in the system</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <SystemStats />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <GymsOverview />
      </Suspense>
    </div>
  );
}

async function SystemStats() {
  const stats = await getSystemStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <GradientStatCard
        title="Total Gyms"
        value={stats.totalGyms.toString()}
        icon={Building2}
        gradient="gradient-primary"
      />
      <GradientStatCard
        title="Admins"
        value={stats.totalAdmins.toString()}
        icon={UserCog}
        gradient="gradient-secondary"
      />
      <GradientStatCard
        title="Trainers"
        value={stats.totalTrainers.toString()}
        icon={Users}
        gradient="gradient-accent"
      />
      <GradientStatCard
        title="Members"
        value={stats.totalMembers.toString()}
        icon={Users}
        gradient="gradient-warning"
      />
      <GradientStatCard
        title="Workout Plans"
        value={stats.totalWorkoutPlans.toString()}
        icon={Dumbbell}
        gradient="gradient-primary"
      />
      <GradientStatCard
        title="Diet Plans"
        value={stats.totalDietPlans.toString()}
        icon={TrendingUp}
        gradient="gradient-secondary"
      />
    </div>
  );
}

async function GymsOverview() {
  const gyms = await getGymsList();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Gyms Overview
        </h2>
        <p className="text-sm text-muted-foreground">All registered gyms and their statistics</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-left">
              <th className="px-4 sm:px-6 py-3 font-medium text-muted-foreground text-sm">Gym Name</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-muted-foreground text-sm">Contact</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-muted-foreground text-sm text-center">Members</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-muted-foreground text-sm text-center">Trainers</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-muted-foreground text-sm">Created</th>
            </tr>
          </thead>
          <tbody>
            {gyms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No gyms registered yet</p>
                </td>
              </tr>
            ) : (
              gyms.map((gym) => (
                <tr key={gym.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="font-medium text-foreground">{gym.name}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-muted-foreground">
                    <div className="flex flex-col text-sm">
                      <span>{gym.email || '-'}</span>
                      <span>{gym.phone || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
                      {gym.memberCount}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-500">
                      {gym.trainerCount}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-muted-foreground text-sm">
                    {new Date(gym.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-28 bg-muted/20 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="h-8 w-48 bg-muted/20 rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

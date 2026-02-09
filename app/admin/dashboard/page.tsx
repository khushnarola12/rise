import { Suspense } from 'react';
import { getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { StatCard, GradientStatCard } from '@/components/stat-card';
import { Users, UserCog, Dumbbell, Calendar, TrendingUp, Activity, DollarSign, TrendingDown, CreditCard, Loader2 } from 'lucide-react';

// Analytics data fetcher
async function getAnalytics(gymId: string) {
  // Attempt to use the Optimized Database Function (RPC)
  const { data, error } = await supabaseAdmin.rpc('get_gym_analytics', { p_gym_id: gymId });

  if (!error && data) {
    return {
      revenue: Number(data.revenue),
      expenses: Number(data.expenses),
      payroll: Number(data.payroll),
      profit: Number(data.profit)
    };
  }

  // Fallback: Client-side Aggregation (Slower, but works if SQL script not run)
  console.warn("Using fallback analytics aggregation (Run 'analytics_optimization.sql' for speed)");
  
  const [financeResult, profilesResult] = await Promise.all([
    supabaseAdmin.from('financial_transactions').select('amount, type').eq('gym_id', gymId),
    supabaseAdmin.from('user_profiles').select('salary').not('salary', 'is', null)
  ]);

  const transactions = financeResult.data || [];
  const profiles = profilesResult.data || [];

  const revenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const payroll = profiles.reduce((sum, p) => sum + Number(p.salary || 0), 0);

  return {
    revenue,
    expenses,
    payroll,
    profit: revenue - (expenses + payroll)
  };
}

// Recent Transactions Component
async function RecentTransactions({ gymId }: { gymId: string }) {
  const { data: transactions } = await supabaseAdmin
    .from('financial_transactions')
    .select('id, description, category, amount, type, transaction_date')
    .eq('gym_id', gymId)
    .order('transaction_date', { ascending: false })
    .limit(5);

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
        <CreditCard className="w-5 h-5 text-primary" />
        Recent Transactions
      </h2>
      <div className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm sm:text-base truncate">{t.description || t.category}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.transaction_date).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold text-sm sm:text-base whitespace-nowrap ml-2 ${t.type === 'revenue' ? 'text-green-500' : 'text-red-500'}`}>
                {t.type === 'revenue' ? '+' : '-'}${Number(t.amount).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground italic text-sm">
            No transactions recorded yet. Add members to see revenue!
          </div>
        )}
      </div>
    </div>
  );
}

// Financial Analytics Summary Component
async function FinancialSummary({ gymId }: { gymId: string }) {
  const stats = await getAnalytics(gymId);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <GradientStatCard
        title="Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        icon={DollarSign}
        gradient="gradient-success"
      />
      <GradientStatCard
        title="Profit"
        value={`$${stats.profit.toLocaleString()}`}
        icon={TrendingUp}
        gradient="gradient-info"
      />
      <GradientStatCard
        title="Expenses"
        value={`$${stats.expenses.toLocaleString()}`}
        icon={TrendingDown}
        gradient="gradient-warning"
      />
      <GradientStatCard
        title="Payroll"
        value={`$${stats.payroll.toLocaleString()}`}
        icon={Users}
        gradient="gradient-accent"
      />
    </div>
  );
}

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
      .select('subscription_expires_at, created_at')
      .eq('id', user?.gym_id)
      .single()
  ]);

  // Calculate days remaining
  let daysRemaining = 0;
  const now = new Date();
  
  if (gymData?.subscription_expires_at) {
    const expires = new Date(gymData.subscription_expires_at);
    const diffTime = expires.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else if (gymData?.created_at) {
    const createdAt = new Date(gymData.created_at);
    const expiresFromCreation = new Date(createdAt);
    expiresFromCreation.setFullYear(expiresFromCreation.getFullYear() + 1);
    const diffTime = expiresFromCreation.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    daysRemaining = 0;
  }
  
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

      {/* Gym Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <GradientStatCard
          title="Subscription"
          value={daysDisplay}
          icon={Calendar}
          gradient={isExpired ? "bg-gradient-to-br from-red-500 to-red-600" : (daysRemaining < 30 ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-emerald-500 to-teal-500")}
        />
        <GradientStatCard
          title="Members"
          value={totalMembers || 0}
          icon={Users}
          gradient="gradient-primary"
        />
        <GradientStatCard
          title="Trainers"
          value={totalTrainers || 0}
          icon={UserCog}
          gradient="gradient-secondary"
        />
        <GradientStatCard
          title="Workouts"
          value={totalWorkouts || 0}
          icon={Dumbbell}
          gradient="gradient-accent"
        />
      </div>

      {/* Financial Analytics Section */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Financial Overview
        </h2>
        <Suspense fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 sm:h-28 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        }>
          <FinancialSummary gymId={user?.gym_id || ''} />
        </Suspense>
      </div>

      {/* Two Column Layout: Attendance & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Attendance */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Today's Attendance</h2>
            <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-semibold text-sm">
              {todayAttendance?.length || 0} Present
            </div>
          </div>
          
          {todayAttendance && todayAttendance.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {todayAttendance.slice(0, 6).map((attendance: any) => (
                <div
                  key={attendance.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {attendance.users?.first_name} {attendance.users?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attendance.check_in_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No attendance recorded today</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <Suspense fallback={
          <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 h-[300px] animate-pulse">
            <div className="h-6 w-48 bg-muted/40 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-muted/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        }>
          <RecentTransactions gymId={user?.gym_id || ''} />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
          title="Workout Plans"
          href="/admin/workouts"
          icon={Dumbbell}
          color="bg-green-500"
        />
        <QuickActionCard
          title="Diet Plans"
          href="/admin/diets"
          icon={Calendar}
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
      className="group p-4 sm:p-5 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300 card-hover"
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <h3 className="font-semibold text-foreground text-sm sm:text-base">{title}</h3>
    </a>
  );
}

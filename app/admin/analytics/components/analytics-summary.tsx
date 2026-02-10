import { supabaseAdmin } from '@/lib/supabase-admin';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { GradientStatCard } from '@/components/stat-card';

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
  
  // Fetch financial transactions filtered by gym_id
  // Fetch user profiles filtered by gym_id using inner join with users table
  const [financeResult, payrollResult] = await Promise.all([
    supabaseAdmin
      .from('financial_transactions')
      .select('amount, type')
      .eq('gym_id', gymId),
    supabaseAdmin
      .from('users')
      .select('user_profiles!inner(salary)')
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .not('user_profiles.salary', 'is', null)
  ]);

  const transactions = financeResult.data || [];
  const payrollData = payrollResult.data || [];

  const revenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const payroll = payrollData.reduce((sum: number, u: any) => {
    const salary = u.user_profiles?.salary || 0;
    return sum + Number(salary);
  }, 0);

  return {
    revenue,
    expenses,
    payroll,
    profit: revenue - (expenses + payroll)
  };
}

export default async function AnalyticsSummary({ gymId }: { gymId: string }) {
  const stats = await getAnalytics(gymId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <GradientStatCard
        title="Total Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        icon={DollarSign}
        gradient="gradient-primary"
      />
      <GradientStatCard
        title="Net Profit"
        value={`$${stats.profit.toLocaleString()}`}
        icon={TrendingUp}
        gradient="gradient-secondary"
      />
      <GradientStatCard
        title="Total Expenses"
        value={`$${stats.expenses.toLocaleString()}`}
        icon={TrendingDown}
        gradient="gradient-accent"
      />
      <GradientStatCard
        title="Monthly Payroll"
        value={`$${stats.payroll.toLocaleString()}`}
        icon={Users}
        gradient="gradient-warning"
      />
    </div>
  );
}

import { Suspense } from 'react';
import { getCurrentUserData } from '@/lib/auth';
import { Loader2, Users } from 'lucide-react';
import AnalyticsSummary from './components/analytics-summary';
import RecentTransactions from './components/recent-transactions';

export default async function AnalyticsPage() {
  const user = await getCurrentUserData();
  if (!user?.gym_id) return null;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financial Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Revenue, Salaries & Profit Overview</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <AnalyticsSummary gymId={user.gym_id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <Suspense fallback={<CardSkeleton />}>
          <RecentTransactions gymId={user.gym_id} />
        </Suspense>

        {/* Salary Distribution Placeholder (Example of static content mixed with dynamic) */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center min-h-[250px] sm:min-h-[300px]">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Trainer Performance Info</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-2">
            Detailed breakdown of trainer revenue generation vs. salary cost will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-muted/20 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return <div className="h-[300px] bg-muted/20 rounded-xl animate-pulse" />;
}

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = memo(function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-4 sm:p-5',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">{value}</h3>
          
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-1.5 flex items-center gap-1',
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>

        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      </div>
    </div>
  );
});

interface GradientStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
}

export const GradientStatCard = memo(function GradientStatCard({ title, value, icon: Icon, gradient }: GradientStatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-4 sm:p-5 relative overflow-hidden',
      gradient
    )}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        
        <p className="text-xs sm:text-sm font-medium text-white/80 mb-0.5">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
});

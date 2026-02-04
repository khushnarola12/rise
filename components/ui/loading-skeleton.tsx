import { memo } from 'react';
import { Loader2 } from 'lucide-react';

// Simple loading spinner
export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'md',
  text = 'Loading...'
}: { 
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-primary/20 border-t-primary rounded-full animate-spin`} />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
});

// Full page loading
export const PageLoading = memo(function PageLoading({ 
  title = 'Loading...',
  description = 'Please wait while we prepare your content'
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
});

// Dashboard skeleton loading
export const DashboardSkeleton = memo(function DashboardSkeleton({
  statCards = 4,
  contentCards = 2
}: {
  statCards?: number;
  contentCards?: number;
}) {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-7 w-48"></div>
        <div className="skeleton h-4 w-64"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(statCards)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-3 w-20"></div>
                <div className="skeleton h-6 w-14"></div>
              </div>
              <div className="skeleton w-11 h-11 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      {contentCards > 0 && (
        <div className={`grid grid-cols-1 ${contentCards > 1 ? 'lg:grid-cols-2' : ''} gap-6`}>
          {[...Array(contentCards)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6">
              <div className="space-y-4">
                <div className="skeleton h-5 w-32"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="skeleton w-10 h-10 rounded-lg"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 w-3/4"></div>
                        <div className="skeleton h-2 w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      <div className="flex items-center justify-center gap-2 py-4">
        <LoadingSpinner size="sm" />
      </div>
    </div>
  );
});

// Table skeleton
export const TableSkeleton = memo(function TableSkeleton({
  rows = 5,
  columns = 4
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-border p-4 flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="skeleton h-4 flex-1"></div>
        ))}
      </div>
      
      {/* Table Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-border last:border-0 p-4 flex gap-4 items-center">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="skeleton h-4 flex-1" style={{ width: colIndex === 0 ? '40%' : 'auto' }}></div>
          ))}
        </div>
      ))}
    </div>
  );
});

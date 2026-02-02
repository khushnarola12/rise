import { Dumbbell } from 'lucide-react';

export default function UserLoading() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="skeleton skeleton-title w-48"></div>
        <div className="skeleton skeleton-text w-64"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-3 w-20"></div>
                <div className="skeleton h-7 w-16"></div>
              </div>
              <div className="skeleton w-12 h-12 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div className="skeleton h-5 w-32"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
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

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div className="skeleton h-5 w-28"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-lg"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-2/3"></div>
                    <div className="skeleton h-2 w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Loading Indicator */}
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

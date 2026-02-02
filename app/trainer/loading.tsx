export default function TrainerLoading() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-7 w-48"></div>
        <div className="skeleton h-4 w-64"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="skeleton h-5 w-32 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="skeleton w-10 h-10 rounded-full"></div>
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-3/4"></div>
                <div className="skeleton h-2 w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Animated gradient ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent animate-spin blur-sm"></div>
          <div className="relative bg-background rounded-full p-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground mb-1">Loading Dashboard...</h3>
          <p className="text-xs text-muted-foreground">Fetching your data</p>
        </div>
      </div>
    </div>
  );
}

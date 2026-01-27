import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Loading Gym Data...</h2>
      <p className="text-muted-foreground">Fetching the latest stats for you.</p>
    </div>
  );
}

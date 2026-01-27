import { Construction } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
        <Construction className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <p className="text-muted-foreground max-w-md">
        This module is currently under development. Here you will be able to view detailed gym analytics.
      </p>
    </div>
  );
}

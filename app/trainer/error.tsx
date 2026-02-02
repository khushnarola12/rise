'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function TrainerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Trainer section error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-xl font-bold text-foreground mb-2">
            Trainer Panel Error
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Something went wrong. Please try again or contact support if the issue persists.
          </p>

          {error.message && (
            <div className="mb-6 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-500 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
            
            <Link
              href="/trainer/dashboard"
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

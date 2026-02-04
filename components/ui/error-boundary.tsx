'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  homePath?: string;
  homeLabel?: string;
  section?: string;
}

export function ErrorBoundary({ 
  error, 
  reset, 
  title = 'Something went wrong!',
  description = 'We encountered an unexpected error. Please try again.',
  homePath = '/',
  homeLabel = 'Dashboard',
  section = 'Application'
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(`${section} error:`, error);
  }, [error, section]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-xl font-bold text-foreground mb-2">
            {title}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {description}
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
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <Link
              href={homePath}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {homeLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

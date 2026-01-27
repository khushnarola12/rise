'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';


export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Avoid hydration mismatch
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-muted transition-colors relative"
      aria-label="Toggle Theme"
    >
      {(resolvedTheme || theme) === 'dark' ? (
        <Moon className="w-5 h-5 text-foreground transition-all" />
      ) : (
        <Sun className="w-5 h-5 text-orange-500 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

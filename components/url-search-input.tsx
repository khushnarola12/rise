'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

interface URLSearchInputProps {
  placeholder?: string;
  className?: string;
}

export function URLSearchInput({ placeholder = 'Search...', className = '' }: URLSearchInputProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  
  const [term, setTerm] = useState(searchParams.get('q')?.toString() || '');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((searchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, replace]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    setTimeoutId(newTimeoutId);
  };

  const handleClear = () => {
    setTerm('');
    handleSearch('');
    if (timeoutId) clearTimeout(timeoutId);
  };

  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full appearance-none !pl-11 pr-8 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-10"
      />
      {term && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
      )}
    </div>
  );
}

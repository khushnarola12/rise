'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchableListProps<T> {
  items: T[];
  searchKeys: (keyof T)[];
  placeholder?: string;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function SearchableList<T extends Record<string, any>>({
  items,
  searchKeys,
  placeholder = 'Search...',
  renderItem,
  emptyMessage = 'No items found',
  className = '',
}: SearchableListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      })
    );
  }, [items, searchKeys, searchQuery]);

  return (
    <div className={className}>
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-3">
          Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>{searchQuery ? `No results for "${searchQuery}"` : emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredItems.map((item, index) => (
            <div key={index}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple search input component
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

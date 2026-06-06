'use client';

import { useState, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (destination: string) => void;
  onLocate?: () => void;
  loading?: boolean;
  defaultValue?: string;
}

export function SearchBar({ onSearch, onLocate, loading, defaultValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search city, region or country..."
            className={cn(
              'pl-9 pr-9 h-11 text-sm font-medium',
              'border-border bg-background',
              'focus-visible:ring-1 focus-visible:ring-ring',
              'placeholder:text-muted-foreground/60',
            )}
            disabled={loading}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={loading || !value.trim()}
          className="h-11 px-4 shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </Button>

        {onLocate && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onLocate}
            disabled={loading}
            className="h-11 w-11 shrink-0"
            title="Use my location"
          >
            <MapPin size={16} />
          </Button>
        )}
      </div>
    </form>
  );
}
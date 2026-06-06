'use client';

import { Cloud, CloudOff, Loader2 } from 'lucide-react';

export function WeatherSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 rounded-xl bg-muted" />
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}

export function WeatherError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center gap-3 text-center">
      <CloudOff size={32} className="text-destructive/60" />
      <div>
        <p className="font-semibold text-sm text-foreground">Failed to load weather</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{message}</p>
      </div>
    </div>
  );
}

export function WeatherEmpty() {
  return (
    <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-4 text-center">
      <Cloud size={40} className="text-muted-foreground/40" />
      <div>
        <p className="font-semibold text-sm text-foreground">Search for a location</p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
          Enter any city, region, or country to get current conditions and forecast data.
        </p>
      </div>
    </div>
  );
}

export function WeatherLoading() {
  return (
    <div className="rounded-xl border border-border bg-card p-10 flex flex-col items-center gap-3 text-center">
      <Loader2 size={28} className="text-muted-foreground animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">Fetching weather data…</p>
    </div>
  );
}
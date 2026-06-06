'use client';

import { ForecastPeriod, WeatherUnits } from '@/types/weather.types';
import { PERIODS, UNITS } from '@/lib/weather-utils';
import { cn } from '@/lib/utils';

interface ForecastControlsProps {
  period: ForecastPeriod;
  units: WeatherUnits;
  onPeriodChange: (p: ForecastPeriod) => void;
  onUnitsChange: (u: WeatherUnits) => void;
}

export function ForecastControls({
  period,
  units,
  onPeriodChange,
  onUnitsChange,
}: ForecastControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Period tabs */}
      <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 gap-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-semibold transition-all',
              period === p.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Units toggle */}
      <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 gap-0.5">
        {UNITS.map((u) => (
          <button
            key={u.value}
            onClick={() => onUnitsChange(u.value)}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-semibold transition-all',
              units === u.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
'use client';

import { IHourlyWeather, WeatherUnits } from '@/types/weather.types';
import { formatTemp, formatHour, conditionLabel } from '@/lib/weather-utils';
import { Droplets, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HourlyHighlightsProps {
  hours: IHourlyWeather[];
  units: WeatherUnits;
}

interface HourCardProps {
  hour: IHourlyWeather;
  units: WeatherUnits;
  isNow?: boolean;
}

function HourCard({ hour, units, isNow }: HourCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-3 min-w-[88px] shrink-0 transition-colors',
        isNow
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card text-foreground',
      )}
    >
      <span className={cn('text-xs font-semibold', isNow ? 'text-background' : 'text-muted-foreground')}>
        {isNow ? 'Now' : formatHour(hour.time)}
      </span>

      {hour.icon && (
        <div className="relative w-10 h-10">
          <Image
            src={hour.icon}
            alt={hour.condition_code}
            fill
            className={cn('object-contain', isNow ? 'brightness-0 invert' : '')}
            unoptimized
          />
        </div>
      )}

      <span className="text-base font-bold tabular-nums">{formatTemp(hour.temperature, units)}</span>

      <div className={cn('flex items-center gap-1 text-xs', isNow ? 'text-background/70' : 'text-muted-foreground')}>
        <Droplets size={10} />
        <span>{hour.precipitation_probability}%</span>
      </div>

      <div className={cn('flex items-center gap-1 text-xs', isNow ? 'text-background/70' : 'text-muted-foreground')}>
        <Wind size={10} />
        <span>{Math.round(hour.wind_speed)}</span>
      </div>
    </div>
  );
}

export function HourlyHighlights({ hours, units }: HourlyHighlightsProps) {
  if (!hours.length) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        Hourly Highlights
      </h3>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {hours.map((hour, i) => (
          <HourCard key={hour.time} hour={hour} units={units} isNow={i === 0} />
        ))}
      </div>
    </div>
  );
}
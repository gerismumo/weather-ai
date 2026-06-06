'use client';

import { IHourlyWeather, WeatherUnits } from '@/types/weather.types';
import { Droplets, Thermometer, Wind, Sun } from 'lucide-react';
import { formatTemp, formatWindSpeed } from '@/lib/weather-utils';
import { cn } from '@/lib/utils';

interface WeatherDetailProps {
  hourly: IHourlyWeather;
  units: WeatherUnits;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bar?: number; // 0-100
}

function DetailRow({ icon, label, value, bar }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="text-muted-foreground [&>svg]:size-4 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
        </div>
        {bar !== undefined && (
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function WeatherDetails({ hourly, units }: WeatherDetailProps) {
  const uvLabel = (uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
        Current Details
      </h3>
      <div className="rounded-xl border border-border bg-card px-4 divide-y divide-border">
        <DetailRow
          icon={<Thermometer />}
          label="Feels Like"
          value={formatTemp(hourly.feels_like, units)}
        />
        <DetailRow
          icon={<Droplets />}
          label="Humidity"
          value={`${hourly.humidity}%`}
          bar={hourly.humidity}
        />
        <DetailRow
          icon={<Sun />}
          label="UV Index"
          value={`${hourly.uv_index} · ${uvLabel(hourly.uv_index)}`}
          bar={(hourly.uv_index / 11) * 100}
        />
        <DetailRow
          icon={<Wind />}
          label="Wind Gust"
          value={formatWindSpeed(hourly.wind_gust, units)}
        />
        <DetailRow
          icon={<Droplets />}
          label="Rain Chance"
          value={`${hourly.precipitation_probability}%`}
          bar={hourly.precipitation_probability}
        />
      </div>
    </div>
  );
}
'use client';

import { IWeatherStats, WeatherUnits } from '@/types/weather.types';
import { formatTemp, formatWindSpeed } from '@/lib/weather-utils';
import { Thermometer, Droplets, Wind, CloudRain, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface WeatherStatsProps {
  stats: IWeatherStats;
  units: WeatherUnits;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function StatItem({ icon, label, value, sub }: StatItemProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="[&>svg]:size-3.5">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div>
        <div className="text-xl font-bold text-foreground tabular-nums">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function WeatherStats({ stats, units }: WeatherStatsProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        Period Summary
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        <StatItem
          icon={<Thermometer />}
          label="Avg Temp"
          value={formatTemp(stats.avg_temp, units)}
          sub={`${formatTemp(stats.min_temp, units)} – ${formatTemp(stats.max_temp, units)}`}
        />
        <StatItem
          icon={<TrendingUp />}
          label="Peak Temp"
          value={formatTemp(stats.max_temp, units)}
          sub="Max recorded"
        />
        <StatItem
          icon={<TrendingDown />}
          label="Low Temp"
          value={formatTemp(stats.min_temp, units)}
          sub="Min recorded"
        />
        <StatItem
          icon={<Wind />}
          label="Avg Wind"
          value={formatWindSpeed(stats.avg_wind, units)}
          sub="Mean speed"
        />
        <StatItem
          icon={<Droplets />}
          label="Total Rain"
          value={`${stats.total_precipitation.toFixed(1)} mm`}
          sub={`${stats.days_with_rain} days with rain`}
        />
        <StatItem
          icon={<Calendar />}
          label="Forecast"
          value={`${stats.forecast_days}d`}
          sub="Days ahead"
        />
      </div>
    </div>
  );
}
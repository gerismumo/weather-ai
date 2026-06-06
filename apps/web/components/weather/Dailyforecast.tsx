'use client';

import { IDailyWeather, WeatherUnits } from '@/types/weather.types';
import { formatTemp, formatDate, conditionLabel, formatDateReadAble } from '@/lib/weather-utils';
import { Droplets, Wind, Sunrise, Sunset } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DailyForecastProps {
  forecast: IDailyWeather[];
  units: WeatherUnits;
}

interface DayRowProps {
  day: IDailyWeather;
  units: WeatherUnits;
  isToday: boolean;
  isLast: boolean;
}

function DayRow({ day, units, isToday, isLast }: DayRowProps) {
  const { day: dayLabel, dayNum, month } = formatDate(day.date);

  return (
    <div>
      <div className="py-3 flex items-center gap-3">
        <div className="w-16 shrink-0">
          <div className={cn('text-xs font-bold', isToday ? 'text-foreground' : 'text-muted-foreground')}>
            {isToday ? 'Today' : dayLabel}
          </div>
          <div className="text-xs text-muted-foreground">
            {month} {dayNum}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {day.icon && (
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src={day.icon}
                alt={day.condition_code}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">{conditionLabel(day.condition_code)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-10">
          <Droplets size={10} className="shrink-0" />
          <span>{day.precipitation_probability}%</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-sm font-semibold tabular-nums">
          <span className="text-muted-foreground font-normal">{formatTemp(day.temp_min, units)}</span>
          <span>/</span>
          <span className="text-foreground">{formatTemp(day.temp_max, units)}</span>
        </div>
      </div>
      <div className="flex gap-3 pb-3 text-xs text-muted-foreground pl-16">
        <span className="flex items-center gap-1">
          <Sunrise size={10} /> {formatDateReadAble(day.sunrise)}
        </span>
        <span className="flex items-center gap-1">
          <Sunset size={10} /> {formatDateReadAble(day.sunset)}
        </span>
        <span className="flex items-center gap-1">
          <Wind size={10} /> {Math.round(day.wind_max)} {units === 'metric' ? 'km/h' : 'mph'}
        </span>
        {day.precipitation_sum > 0 && (
          <span className="flex items-center gap-1">
            <Droplets size={10} /> {day.precipitation_sum.toFixed(1)}mm
          </span>
        )}
      </div>

      {!isLast && <Separator />}
    </div>
  );
}

export function DailyForecast({ forecast, units }: DailyForecastProps) {
  if (!forecast.length) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  console.log("for", forecast)

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
        Daily Forecast
      </h3>
      <div className="rounded-xl border border-border bg-card divide-border">
        <div className="px-4">
          {forecast.map((day, i) => (
            <DayRow
              key={day.date}
              day={day}
              units={units}
              isToday={day.date === todayStr}
              isLast={i === forecast.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
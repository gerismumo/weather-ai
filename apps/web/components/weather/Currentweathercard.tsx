'use client';

import { ICurrentWeather, IWeatherLocation, WeatherUnits } from '@/types/weather.types';
import { formatTemp, formatWindSpeed, formatFullDate, windDirectionLabel, conditionLabel } from '@/lib/weather-utils';
import { Wind, Navigation, Clock, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface CurrentWeatherCardProps {
  current: ICurrentWeather;
  location: IWeatherLocation;
  destination: string;
  units: WeatherUnits;
}

export function CurrentWeatherCard({
  current,
  location,
  destination,
  units,
}: CurrentWeatherCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium mb-1">
            <MapPin size={12} />
            <span>{location.country}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground leading-tight">{destination}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock size={12} />
          <span>{new Date(current.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-6xl font-extrabold tracking-tighter text-foreground tabular-nums">
            {formatTemp(current.temperature, units)}
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-1 capitalize">
            {conditionLabel(current.condition_code)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatFullDate(current.time)}
          </p>
        </div>
        {current.icon && (
          <div className="relative w-20 h-20 shrink-0">
            <Image
              src={current.icon}
              alt={current.condition_code}
              fill
              className="object-contain drop-shadow-sm"
              unoptimized
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Wind */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wind size={14} />
          <span className="font-medium text-foreground">{formatWindSpeed(current.wind_speed, units)}</span>
          <span className="text-xs">wind</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Navigation
            size={14}
            style={{ transform: `rotate(${current.wind_direction}deg)` }}
            className="transition-transform"
          />
          <span className="font-medium text-foreground">{windDirectionLabel(current.wind_direction)}</span>
          <span className="text-xs">{current.wind_direction}°</span>
        </div>
      </div>
    </div>
  );
}
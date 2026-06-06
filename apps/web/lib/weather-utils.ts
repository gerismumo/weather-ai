import { ForecastPeriod, WeatherUnits } from '@/types/weather.types';

export function formatTemp(temp: number, units: WeatherUnits): string {
  return `${Math.round(temp)}°${units === 'metric' ? 'C' : 'F'}`;
}

export function formatWindSpeed(speed: number, units: WeatherUnits): string {
  return `${Math.round(speed)} ${units === 'metric' ? 'km/h' : 'mph'}`;
}

export function formatDate(dateStr: string): { day: string; dayNum: string; month: string } {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
  };
}

export function formatDateReadAble(dateStr: string): string {
  const date = new Date(dateStr);

  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatHour(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function formatFullDate(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function windDirectionLabel(deg: number): any {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function conditionLabel(code: string): string {
  const map: Record<string, string> = {
    sunny: 'Sunny',
    clear: 'Clear',
    partly_cloudy: 'Partly Cloudy',
    cloudy: 'Cloudy',
    overcast: 'Overcast',
    rainy: 'Rainy',
    drizzle: 'Drizzle',
    thunderstorm: 'Thunderstorm',
    snow: 'Snow',
    fog: 'Foggy',
    hail: 'Hail',
  };
  return map[code] ?? code.replace(/_/g, ' ');
}

export const PERIODS: { value: ForecastPeriod; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: '7 Days' },
  { value: 'month', label: '30 Days' },
  { value: 'year', label: '365 Days' },
];

export const UNITS: { value: WeatherUnits; label: string }[] = [
  { value: 'metric', label: '°C' },
  { value: 'imperial', label: '°F' },
];
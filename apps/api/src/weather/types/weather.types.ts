export type ForecastPeriod = 'day' | 'week' | 'month' | 'year';
export type Units = 'metric' | 'imperial';

export interface WeatherLocation {
  lat: number;
  lon: number;
  timezone: string;
  requested_lat: number;
  requested_lon: number;
  country: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  condition_code: string;
  icon: string;
  icon_path: string;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  precipitation_probability: number;
  wind_speed: number;
  condition_code: string;
  icon: string;
  humidity: number;
  feels_like: number;
  wind_gust: number;
  uv_index: number;
  icon_path: string;
}

export interface DailyWeather {
  date: string;
  temp_min: number;
  temp_max: number;
  precipitation_sum: number;
  sunrise: string;
  sunset: string;
  condition_code: string;
  icon: string;
  precipitation_probability: number;
  wind_max: number;
  icon_path: string;
}

export interface AiSummary {
  text: string;
  lang: string;
}

export interface WeatherApiResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  ai_summary?: AiSummary;
}

export interface GeoIpResponse {
  ip: string;
  ip_hash: string;
  ip_version: string;
  geo: {
    lat: number;
    lon: number;
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
}

export interface WeatherSearchResult {
  destination: string;
  period: ForecastPeriod;
  units: Units;
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: DailyWeather[];
  hourly_highlights: HourlyWeather[];
  summary?: string;
  stats: WeatherStats;
}

export interface WeatherStats {
  avg_temp: number;
  max_temp: number;
  min_temp: number;
  total_precipitation: number;
  avg_wind: number;
  days_with_rain: number;
  forecast_days: number;
}
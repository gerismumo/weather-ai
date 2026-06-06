
export type ForecastPeriod = 'day' | 'week' | 'month' | 'year';
export type WeatherUnits = 'metric' | 'imperial';


export interface IWeatherLocation {
  lat: number;
  lon: number;
  timezone: string;
  requested_lat: number;
  requested_lon: number;
  country: string;
}


export interface ICurrentWeather {
  time: string;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  condition_code: string;
  icon: string;
  icon_path: string;
}


export interface IHourlyWeather {
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

export interface IDailyWeather {
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


export interface IWeatherStats {
  avg_temp: number;
  max_temp: number;
  min_temp: number;
  total_precipitation: number;
  avg_wind: number;
  days_with_rain: number;
  forecast_days: number;
}


export interface IWeatherSearchResult {
  destination: string;
  period: ForecastPeriod;
  units: WeatherUnits;
  location: IWeatherLocation;
  current: ICurrentWeather;
  forecast: IDailyWeather[];
  hourly_highlights: IHourlyWeather[];
  summary: string | null;
  stats: IWeatherStats;
}


export interface WeatherSearchParams {
  destination: string;
  period?: ForecastPeriod;
  units?: WeatherUnits;
  lang?: string;
  ai?: boolean;
}

export interface WeatherCoordinatesParams {
  lat: number;
  lon: number;
  units?: WeatherUnits;
  lang?: string;
  ai?: boolean;
}
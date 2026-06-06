import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  WeatherApiResponse,
  WeatherSearchResult,
  WeatherStats,
  DailyWeather,
  HourlyWeather,
  ForecastPeriod,
  Units,
} from './types/weather.types';
import { PERIOD_TO_DAYS } from './dto/weather.schema';
import { ENV } from 'common/config/env.config';


interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly base_url = 'https://api.weather-ai.co/v1';
  private readonly geocode_url = 'https://nominatim.openstreetmap.org/search';

  constructor(private readonly http_service: HttpService) {}

  async search_destination(
    destination: string,
    period: ForecastPeriod,
    units: Units,
    lang: string,
    ai: boolean,
  ): Promise<WeatherSearchResult> {
    this.logger.log(
      `Searching weather for destination="${destination}" period=${period} units=${units}`,
    );

    const { lat, lon, display_name } =
      await this.geocode_destination(destination);

    const days:number = PERIOD_TO_DAYS[period]!;

    const weather = await this.fetch_weather(lat, lon, days, units, lang, ai);

    const filtered_daily = this.filter_daily_by_period(weather.daily, period);
    const hourly_highlights = this.get_hourly_highlights(
      weather.hourly,
      period,
    );
    const stats = this.compute_stats(filtered_daily);

    return {
      destination: display_name,
      period,
      units,
      location: weather.location,
      current: weather.current,
      forecast: filtered_daily,
      hourly_highlights,
      summary: weather.ai_summary?.text,
      stats,
    };
  }

  async get_current_by_coordinates(
    lat: number,
    lon: number,
    units: Units,
    lang: string,
    ai: boolean,
  ): Promise<WeatherSearchResult> {
    this.logger.log(`Fetching current weather for lat=${lat} lon=${lon}`);

    const weather = await this.fetch_weather(lat, lon, 1, units, lang, ai);
    const stats = this.compute_stats(weather.daily);

    return {
      destination: `${lat}, ${lon}`,
      period: 'day',
      units,
      location: weather.location,
      current: weather.current,
      forecast: weather.daily,
      hourly_highlights: weather.hourly.slice(0, 12),
      summary: weather.ai_summary?.text,
      stats,
    };
  }

//geocoding
  private async geocode_destination(destination: string): Promise<GeocodeResult> {
    this.logger.debug(`Geocoding destination: ${destination}`);

    try {
      const response: AxiosResponse<GeocodeResult[]> = await firstValueFrom(
        this.http_service.get(this.geocode_url, {
          params: {
            q: destination,
            format: 'json',
            limit: 1,
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'WeatherAI-TravelApp/1.0',
            'Accept-Language': 'en',
          },
        }),
      );

      const results:any = response.data;

      if (!results || results.length === 0) {
        throw new BadRequestException(
          `Destination "${destination}" could not be found. Please check the spelling or try a more specific name.`,
        );
      }

      const { lat, lon, display_name } = results[0];

      return {
        lat: parseFloat(String(lat)),
        lon: parseFloat(String(lon)),
        display_name,
      };
    } catch (error:any) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Geocoding failed for "${destination}": ${error?.message}`,
      );
      throw new ServiceUnavailableException(
        'Location lookup service is temporarily unavailable. Please try again later.',
      );
    }
  }

  //  Weather

  private async fetch_weather(
    lat: number,
    lon: number,
    days: number,
    units: Units,
    lang: string,
    ai: boolean,
  ): Promise<WeatherApiResponse> {
    try {
      const response: AxiosResponse<WeatherApiResponse> = await firstValueFrom(
        this.http_service.get(`${this.base_url}/weather`, {
          params: { lat, lon, days, units, lang, ai },
          headers: {
            Authorization: `Bearer ${ENV.WEATHER_API_KEY}`,
          },
        }),
      );

      return response.data;
    } catch (error:any) {
      const status = error?.response?.status;
      const api_message = error?.response?.data?.message;

      this.logger.error(
        `Weather API error [${status}] for lat=${lat} lon=${lon}: ${api_message || error?.message}`,
      );

      if (status === 401) {
        throw new ServiceUnavailableException(
          'Weather service authentication failed. Please contact support.',
        );
      }
      if (status === 403) {
        throw new BadRequestException(
          'Your current plan does not support this forecast range. Upgrade to access longer forecasts.',
        );
      }
      if (status === 429) {
        throw new ServiceUnavailableException(
          'Weather API quota exceeded. Please try again later.',
        );
      }

      throw new ServiceUnavailableException(
        'Weather data is temporarily unavailable. Please try again in a moment.',
      );
    }
  }


  private filter_daily_by_period(
    daily: DailyWeather[],
    period: ForecastPeriod,
  ): DailyWeather[] {
    const limits: Record<ForecastPeriod, number> = {
      day: 1,
      week: 7,
      month: 14,
      year: 16,
    };
    return daily.slice(0, limits[period]);
  }

  private get_hourly_highlights(
    hourly: HourlyWeather[],
    period: ForecastPeriod,
  ): HourlyWeather[] {
    // For day view return all 24 hours; for other periods return next 48 hours
    if (period === 'day') {
      return hourly.filter((h) => h.time.startsWith(h.time.slice(0, 10))).slice(0, 24);
    }
    return hourly.slice(0, 48);
  }

  private compute_stats(daily: DailyWeather[]): WeatherStats {
    if (!daily.length) {
      return {
        avg_temp: 0,
        max_temp: 0,
        min_temp: 0,
        total_precipitation: 0,
        avg_wind: 0,
        days_with_rain: 0,
        forecast_days: 0,
      };
    }

    const temps_max = daily.map((d) => d.temp_max);
    const temps_min = daily.map((d) => d.temp_min);
    const avg_daily_temps = daily.map((d) => (d.temp_max + d.temp_min) / 2);

    const max_temp = Math.max(...temps_max);
    const min_temp = Math.min(...temps_min);
    const avg_temp =
      avg_daily_temps.reduce((sum, t) => sum + t, 0) / avg_daily_temps.length;

    const total_precipitation = daily.reduce(
      (sum, d) => sum + (d.precipitation_sum ?? 0),
      0,
    );

    const avg_wind =
      daily.reduce((sum, d) => sum + (d.wind_max ?? 0), 0) / daily.length;

    const days_with_rain = daily.filter(
      (d) => d.precipitation_probability > 30,
    ).length;

    return {
      avg_temp: parseFloat(avg_temp.toFixed(1)),
      max_temp: parseFloat(max_temp.toFixed(1)),
      min_temp: parseFloat(min_temp.toFixed(1)),
      total_precipitation: parseFloat(total_precipitation.toFixed(1)),
      avg_wind: parseFloat(avg_wind.toFixed(1)),
      days_with_rain,
      forecast_days: daily.length,
    };
  }
}
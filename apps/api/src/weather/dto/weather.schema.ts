
import { z } from 'zod';

export const forecast_period_values = ['day', 'week', 'month', 'year'] as const;
export const units_values = ['metric', 'imperial'] as const;

export const PERIOD_TO_DAYS: Record<string, number> = {
  day: 1,
  week: 7,
  month: 14,
  year: 16,
};

export const weather_search_schema = z.object({
  destination: z
    .string('destination is required')
    .min(2, 'destination must be at least 2 characters')
    .max(200, 'destination must be at most 200 characters')
    .trim(),

  period: z
    .enum(forecast_period_values, `period must be one of: ${forecast_period_values.join(', ')}`)
    .default('week'),

  units: z
    .enum(units_values, `units must be one of: ${units_values.join(', ')}`)
    .default('metric'),

  lang: z
    .string()
    .length(2, 'lang must be a 2-character language code')
    .toLowerCase()
    .default('en'),

  ai: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .default(true),
});

export type WeatherSearchDto = z.infer<typeof weather_search_schema>;

export const geo_coordinates_schema = z.object({
  lat: z
    .number('latitude is required')
    .min(-90, 'latitude must be between -90 and 90')
    .max(90, 'latitude must be between -90 and 90'),

  lon: z
    .number('longitude is required')
    .min(-180, 'longitude must be between -180 and 180')
    .max(180, 'longitude must be between -180 and 180'),
});

export type GeoCoordinatesDto = z.infer<typeof geo_coordinates_schema>;
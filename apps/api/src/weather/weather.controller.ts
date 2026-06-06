import {
  Controller,
  Get,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WeatherService } from './weather.service';
import { geo_coordinates_schema, weather_search_schema } from './dto/weather.schema';


@Controller('weather')
export class WeatherController {
  constructor(private readonly weather_service: WeatherService) {}

  /**
   * Query params:
   *   destination  string   required  e.g. "Nairobi" or "Paris, France"
   *   period       string   optional  day | week | month | year  (default: week)
   *   units        string   optional  metric | imperial           (default: metric)
   *   lang         string   optional  2-char language code       (default: en)
   *   ai           boolean  optional  include AI summary         (default: true)
   */
  @Get('search')
  async search_destination(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: Record<string, unknown>,
  ) {
    const dto = weather_search_schema.parse({
      destination: query.destination,
      period: query.period ?? 'week',
      units: query.units ?? 'metric',
      lang: query.lang ?? 'en',
      ai: query.ai ?? true,
    });

    const result = await this.weather_service.search_destination(
      dto.destination,
      dto.period,
      dto.units,
      dto.lang,
      dto.ai,
    );

    return res.success(result, 'Weather data retrieved successfully');
  }

  /**
   * Query params:
   *   lat    float   required
   *   lon    float   required
   *   units  string  optional  metric | imperial  (default: metric)
   *   lang   string  optional  2-char code        (default: en)
   *   ai     boolean optional                     (default: true)
   */
  @Get('coordinates')
  async get_by_coordinates(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: Record<string, unknown>,
  ) {
    const coords = geo_coordinates_schema.parse({
      lat: query.lat !== undefined ? parseFloat(String(query.lat)) : undefined,
      lon: query.lon !== undefined ? parseFloat(String(query.lon)) : undefined,
    });

    const units_raw = String(query.units ?? 'metric');
    const lang_raw = String(query.lang ?? 'en');
    const ai_raw = query.ai !== 'false' && query.ai !== false;

    const result = await this.weather_service.get_current_by_coordinates(
      coords.lat,
      coords.lon,
      units_raw as 'metric' | 'imperial',
      lang_raw,
      ai_raw,
    );

    return res.success(result, 'Weather data retrieved successfully');
  }
}

import { IWeatherSearchResult, WeatherCoordinatesParams, WeatherSearchParams } from "@/types/weather.types"
import { ClientHttp } from "./http/http.client.service"
import { apiHandler } from "./handler.service"

/**
 *
 * period  → day | week | month | year  (default: week)
 * units   → metric | imperial          (default: metric)
 * lang    → 2-char language code       (default: en)
 * ai      → include AI summary         (default: true)
 */
export const searchWeatherByDestination = async (
  params: WeatherSearchParams,
) => {
  const result = await apiHandler<IWeatherSearchResult>(
    ClientHttp.get("/weather/search", { params }),
  )

  return result;
}

/**
 * Fetch weather by explicit latitude / longitude.
 */
export const getWeatherByCoordinates = async (
  params: WeatherCoordinatesParams,
) => {
  return apiHandler<IWeatherSearchResult>(
    ClientHttp.get("/weather/coordinates", { params }),
  )
}

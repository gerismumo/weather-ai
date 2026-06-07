
A mobile-first travel weather app. Search any destination and get current conditions, hourly breakdowns, multi-day forecasts and AI-generated summaries.

Built as a Turborepo monorepo with two apps - a Nest.js API backend and a Next.js + shadcn/ui frontend.

---

## Apps

| App | Port | Stack |
|-----|------|-------|
| `apps/api` | `3000` | Nest.js |
| `apps/web` | `3001` | Next.js |


## Prerequisites

- Node.js `22.x`
- pnpm (enabled via corepack - run `corepack enable` once)
- Docker + Docker Compose v2
- A WeatherAI API key - get one at [weather-ai.co](https://weather-ai.co/docs) → Dashboard → API Keys

---

## Local development

### 1. Clone and install

```bash
git clone https://github.com/gerismumo/weather-ai.git
cd weather-ai

corepack enable
pnpm install
```

### 2. Set up environment variables

**API — `apps/api/.env`**

```bash
cp apps/api/.env.example apps/api/.env
```

```env
NODE_ENV=development
HOST_NAME=localhost
PORT=3000

WEATHER_API_KEY=wai_your_key_here

CORS_DEV_ORIGINS=http://localhost:3001
CORS_ORIGINS=
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | yes | `development` \| `production` \| `test` |
| `HOST_NAME` | yes | Server bind address |
| `PORT` | yes | API server port |
| `WEATHER_API_KEY` | yes | WeatherAI bearer token — prefix `wai_` |
| `CORS_DEV_ORIGINS` | no | Comma-separated dev origins |
| `CORS_ORIGINS` | no | Comma-separated production origins |

**Web — `apps/web/.env`**

```bash
cp apps/web/.env.example apps/web/.env
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | yes | Full URL of the API app — exposed to the browser |

> `NEXT_PUBLIC_API_URL` is baked into the Next.js bundle at build time. If you change it, you must rebuild the web app.

### 3. Start

```bash
# Both apps in parallel
pnpm turbo dev

# Or individually
pnpm --filter api dev    # http://localhost:3000
pnpm --filter web dev    # http://localhost:3001
```

---

## Running with Docker (local)

The local `docker-compose.yml` reads a single `.env` file from the repo root. Merge both app env files into one before starting.

```bash
cat apps/api/.env apps/web/.env > .env

docker-compose up --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Web | http://localhost:3001 |

```bash
# Rebuild a single service
docker-compose up --build api

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop
docker-compose down
```

---

## API reference

I have postman collection file in the repo located here: `postman/collection.json`**

### `GET /api/v1/weather/search`

Search weather by destination name.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `destination` | string | yes | - | City, country, or region name |
| `period` | string | no | `week` | `day` \| `week` \| `month` \| `year` |
| `units` | string | no | `metric` | `metric` \| `imperial` |
| `lang` | string | no | `en` | 2-char language code for AI summary |
| `ai` | boolean | no | `true` | Include Gemini AI summary |

**Period → forecast days**

| period | days | plan |
|--------|------|------|
| `day` | 1 | Free |
| `week` | 7 | Free |
| `month` | 14 | Pro+ |
| `year` | 16 | Scale |

**Example**

```
GET /api/v1/weather/search?destination=Nairobi&period=week&units=metric
```

**Success response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Weather data retrieved successfully",
  "data": {
    "destination": "Nairobi, Nairobi County, Kenya",
    "period": "week",
    "units": "metric",
    "location": { "lat": -1.2921, "lon": 36.8219, "country": "KE", "timezone": "Africa/Nairobi" },
    "current": {
      "temperature": 22,
      "wind_speed": 11,
      "wind_direction": 145,
      "condition_code": "2",
      "icon": "https://cdn.weather-ai.co/icons/default/2_partly_cloudy_day.svg",
      "time": "2026-06-07T14:00"
    },
    "forecast": [],
    "hourly_highlights": [],
    "summary": "Partly cloudy with mild temperatures...",
    "stats": {
      "avg_temp": 21.3,
      "max_temp": 26.1,
      "min_temp": 14.5,
      "total_precipitation": 0,
      "avg_wind": 13.4,
      "days_with_rain": 1,
      "forecast_days": 7
    }
  }
}
```

**Error response**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "destination is required (destination)"
}
```

### `GET /api/v1/weather/coordinates`

Fetch weather by explicit lat/lon.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | float | yes | Latitude (−90 to 90) |
| `lon` | float | yes | Longitude (−180 to 180) |
| `units` | string | no | `metric` \| `imperial` |
| `lang` | string | no | 2-char language code |
| `ai` | boolean | no | Include AI summary |

**Example**

```
GET /api/v1/weather/coordinates?lat=-1.2921&lon=36.8219&units=metric
```

### Error codes

| Status | Meaning |
|--------|---------|
| `400` | Invalid or missing parameters / destination not found |
| `403` | Plan does not support this forecast range |
| `429` | WeatherAI monthly quota exceeded |
| `503` | WeatherAI or geocoding service unavailable |

---

## External services

| Service | Purpose | Auth |
|---------|---------|------|
| WeatherAI API | Real-time weather, forecasts, Gemini AI summaries | Bearer token - `WEATHER_API_KEY` |
| OpenStreetMap Nominatim | Forward geocoding (destination name → lat/lon) | None - free, `User-Agent` header required |

---

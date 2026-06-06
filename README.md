Skies & Places
WeatherAI Travel Application
Full-Stack Monorepo — Technical README
──────────────────────────────────────────────
NestJS API  ·  Next.js 15 Web  ·  Turborepo  ·  Docker

Stack	Node · TypeScript · pnpm workspaces · Turborepo
Backend	NestJS · WeatherAI REST API · Zod · Axios
Frontend	Next.js (App Router) · Tailwind CSS · shadcn/ui
DevOps	Docker multi-stage builds · docker-compose · external overlay network


1. Overview
Skies & Places is a full-stack travel weather application built in a Turborepo monorepo. Users search any destination worldwide and receive current conditions, hourly highlights, multi-day forecasts, aggregated statistics, and an optional Gemini AI summary — all served from a dedicated NestJS REST API that proxies and enriches data from the WeatherAI API (weather-ai.co).

1.1 Feature Set
•	Destination search — geocoded via OpenStreetMap Nominatim
•	Forecast periods: today, 7-day, 14-day (Pro), 16-day (Scale)
•	Metric / imperial unit toggle
•	AI-powered summaries in any language (Gemini, optional)
•	Period statistics: avg/max/min temp, precipitation, wind, rainy days
•	Persistent recent searches (localStorage)
•	Explore page with curated destinations by region
•	Mobile-first responsive UI with dark-mode support

1.2 High-Level Architecture
┌─────────────────────────────────────────────────────────────┐
│                    Turborepo Monorepo                       │
│                                                             │
│  apps/web  (Next.js 15)        apps/api  (NestJS)          │
│  ─────────────────────         ─────────────────────────   │
│  pages / components            WeatherModule               │
│  weather.client.service  ───▶  GET /api/v1/weather/search  │
│  weather.client.types          GET /api/v1/weather/coords  │
│  shadcn/ui + Tailwind          Nominatim geocoding          │
│                                WeatherAI REST proxy        │
│                                Zod validation              │
│                                                             │
│                          ▲                                  │
│                          │ HTTP                            │
│                   WeatherAI API                            │
│                   weather-ai.co                            │
└─────────────────────────────────────────────────────────────┘


2. Repository Structure
.
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.config.ts
│   │   │   │   └── env.types.ts
│   │   │   ├── common/
│   │   │   │   ├── filters/global-exception.filter.ts
│   │   │   │   ├── middleware/response.middleware.ts
│   │   │   │   ├── responses/api-responses.ts
│   │   │   │   └── types/express.d.ts
│   │   │   ├── weather/
│   │   │   │   ├── types/weather.types.ts
│   │   │   │   ├── schemas/weather.schema.ts
│   │   │   │   ├── weather.controller.ts
│   │   │   │   ├── weather.service.ts
│   │   │   │   └── weather.module.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                  # Next.js 15 frontend
│       ├── app/              # App Router pages
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── weather/[destination]/
│       ├── components/       # shadcn + custom components
│       ├── services/
│       │   ├── weather.client.service.ts
│       │   ├── handler.service.ts
│       │   └── http/http.client.service.ts
│       ├── types/
│       │   └── weather.client.types.ts
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json


3. Prerequisites
Tool	Version	Purpose
Node.js	22.x LTS	Runtime for both apps
pnpm	9.x +	Package manager (corepack enabled)
Turborepo	2.x +	Monorepo build orchestration
Docker	26.x +	Containerised deployment
WeatherAI key	Any plan	api.weather-ai.co — set WEATHER_API_KEY

ℹ  Month/extended forecasts require a Pro or Scale WeatherAI plan. Free plan limits forecasts to 7 days.


4. Quick Start — Local Development
4.1 Clone & install
git clone https://github.com/your-org/skies-and-places.git
cd skies-and-places
 
# Enable pnpm via corepack (first time only)
corepack enable
corepack prepare pnpm@latest --activate
 
# Install all workspace dependencies
pnpm install

4.2 Environment variables
API — apps/api/.env
HOST_NAME=localhost
PORT=3000
NODE_ENV=development
 
# WeatherAI — Dashboard → API Keys → Generate
WEATHER_API_KEY=wai_your_key_here
 
# CORS — comma-separated allowed origins (optional)
CORS_ORIGINS=http://localhost:3001
CORS_DEV_ORIGINS=http://localhost:3001,http://localhost:3000

Web — apps/web/.env.local
# Must point at the running API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

4.3 Run all apps
# From monorepo root — starts API + Web in parallel
pnpm dev
 
# Or start individually
pnpm --filter api dev          # NestJS on :3000
pnpm --filter web dev          # Next.js on :3001

Service	URL	Notes
API	http://localhost:3000	NestJS + global prefix /api/v1
Web	http://localhost:3001	Next.js dev server
API docs	http://localhost:3000/api/v1/weather/search?destination=Nairobi	Smoke test endpoint


5. Backend — apps/api (NestJS)
5.1 Configuration
Environment is loaded by src/config/env.config.ts. It reads .env, .env.development, .env.production, .env.local (later files do not override earlier ones). All required variables throw at startup if missing.

Variable	Required	Default	Description
PORT	Yes	—	TCP port the server listens on
NODE_ENV	Yes	—	development | production | test
WEATHER_API_KEY	Yes	—	WeatherAI bearer token (wai_…)
HOST_NAME	No	localhost	Bind address
CORS_ORIGINS	No	*	Comma-separated allowed origins (prod)
CORS_DEV_ORIGINS	No	unset	Extra dev origins, merged in non-prod

5.2 Module structure
WeatherModule is the only feature module. It imports HttpModule (15 s timeout) and wires:
•	WeatherController — route handlers, Zod parsing
•	WeatherService — geocoding (Nominatim), WeatherAI proxy, stats computation

5.3 API endpoints
Method	Path	Description
GET	/api/v1/weather/search	Search by destination name
GET	/api/v1/weather/coordinates	Fetch by lat/lon

GET /api/v1/weather/search
Param	Type	Required	Default	Notes
destination	string	Yes	—	City / country / region name
period	string	No	week	day | week | month | year
units	string	No	metric	metric | imperial
lang	string	No	en	2-char language code for AI summary
ai	boolean	No	true	Include Gemini AI summary

Period → forecast days mapping
Period	Days requested	Minimum plan
day	1	Free
week	7	Free
month	14	Pro
year	16	Scale

GET /api/v1/weather/coordinates
Param	Type	Required	Range	Notes
lat	float	Yes	-90 to 90	Latitude
lon	float	Yes	-180 to 180	Longitude
units	string	No	metric|imperial	
lang	string	No	2 chars	Language code
ai	boolean	No	true|false	AI summary

5.4 Response shape
{
  "success": true,
  "statusCode": 200,
  "message": "Weather data retrieved successfully",
  "data": {
    "destination": "Nairobi, Nairobi County, Kenya",
    "period": "week",
    "units": "metric",
    "location": { "lat": -1.2921, "lon": 36.8219, "country": "KE", ... },
    "current": {
      "temperature": 22,
      "wind_speed": 11.2,
      "condition_code": "2",
      "icon": "https://cdn.weather-ai.co/icons/default/2_partly_cloudy_day.svg"
    },
    "forecast": [ /* IDailyWeather[] */ ],
    "hourly_highlights": [ /* IHourlyWeather[] */ ],
    "summary": "Partly cloudy with mild temperatures...",
    "stats": {
      "avg_temp": 21.3, "max_temp": 26, "min_temp": 14,
      "total_precipitation": 0, "avg_wind": 13,
      "days_with_rain": 1, "forecast_days": 7
    }
  }
}

5.5 Error handling
All errors pass through GlobalHttpExceptionFilter. ZodError is caught and converted to a 400 with human-readable field paths.
Status	Cause
400	Missing/invalid query params (Zod) or unknown destination (geocoding)
403	WeatherAI plan does not cover requested forecast length
429	WeatherAI monthly quota exceeded
503	WeatherAI unreachable, Nominatim unreachable, or gateway error

5.6 Build & test
# From apps/api or monorepo root
pnpm --filter api build    # Compiles TypeScript → dist/
pnpm --filter api test     # Jest unit tests
pnpm --filter api lint     # ESLint


6. Frontend — apps/web (Next.js 15)
6.1 Configuration
Variable	Required	Description
NEXT_PUBLIC_API_URL	Yes	Base URL of the NestJS API including /api/v1 prefix

ℹ  NEXT_PUBLIC_API_URL is a build-time variable — it must be set before running next build. In Docker, pass it as a build ARG.

6.2 Pages & routing (App Router)
Route	File	Description
/	app/page.tsx	Home — search input, popular picks, recent
/weather/[destination]	app/weather/[destination]/page.tsx	Results — current, hourly, daily, stats
/explore	app/explore/page.tsx	Curated destinations by region
/settings	app/settings/page.tsx	Unit toggle, AI toggle, clear history

6.3 HTTP client layer
Three files form the client HTTP layer, mirroring the pattern used for other domains (blogs, auth, etc.).

services/http/http.client.service.ts
Thin wrapper around axios that prepends NEXT_PUBLIC_API_URL and injects auth headers when present.

services/handler.service.ts
Wraps every Axios call: normalises the { success, data, message } envelope, surfaces error messages, and rethrows typed errors.

services/weather.client.service.ts
import type { IWeatherSearchResult, WeatherSearchParams,
              WeatherCoordinatesParams } from "../types/weather.client.types"
import { apiHandler } from "./handler.service"
import { ClientHttp } from "./http/http.client.service"
 
export const searchWeatherByDestination = async (params: WeatherSearchParams) =>
  apiHandler<IWeatherSearchResult>(ClientHttp.get("/weather/search", { params }))
 
export const getWeatherByCoordinates = async (params: WeatherCoordinatesParams) =>
  apiHandler<IWeatherSearchResult>(ClientHttp.get("/weather/coordinates", { params }))

6.4 Type system — types/weather.client.types.ts
Type / Interface	Description
ForecastPeriod	"day" | "week" | "month" | "year"
WeatherUnits	"metric" | "imperial"
IWeatherLocation	lat, lon, timezone, country, requested_lat/lon
ICurrentWeather	temperature, wind_speed, condition_code, icon
IHourlyWeather	time, temperature, feels_like, humidity, uv_index, …
IDailyWeather	date, temp_min/max, precipitation, sunrise/sunset, …
IWeatherStats	avg/max/min temp, total_precipitation, days_with_rain, …
IWeatherSearchResult	Full API response — destination, period, current, forecast, stats, summary
WeatherSearchParams	Query DTO for searchWeatherByDestination()
WeatherCoordinatesParams	Query DTO for getWeatherByCoordinates()

6.5 Key components
•	SearchBar — debounced input, period pills, keyboard submit
•	CurrentWeatherCard — temperature, feels-like, wind, condition icon
•	HourlyScroll — horizontal scrolling 12-hour strip
•	DailyForecast — day rows with temp-range bar and rain probability
•	WeatherStats — 2-column stat grid (avg temp, wind, rain days, etc.)
•	AiSummary — collapsible Gemini summary badge block
•	ExploreGrid — 2-column destination card grid by region
•	SettingsPanel — unit toggle, AI toggle, clear history

6.6 Build
pnpm --filter web build    # next build → .next/standalone
pnpm --filter web start    # next start (production)
pnpm --filter web lint     # ESLint + TypeScript check


7. Postman Collection
Import WeatherAI_Travel_API.postman_collection.json from the repo root. Set the collection variable base_url to your server (default: http://localhost:3000/api/v1).

Folder	Requests
Weather	Search by destination (day / week / month / year), by coordinates, Swahili AI, imperial units
Validation Errors	Missing destination, invalid period, invalid lang, missing coords, out-of-range coords, unknown place


8. Docker & Deployment
8.1 Multi-stage Dockerfiles
apps/api/Dockerfile — 5-stage pipeline
Stage	Base image	Purpose
base	node:22-slim	Enable corepack, install pnpm + turbo globally
pruner	base	turbo prune api --docker — minimal dependency graph
installer	base	pnpm install --frozen-lockfile on pruned lockfile
builder	installer	pnpm turbo run build — compiles TypeScript → dist/
runner	node:22-slim	Copy dist/ only; node apps/api/dist/main.js

apps/web/Dockerfile — 5-stage pipeline
Stage	Base image	Purpose
base	node:22-slim	Enable corepack, install pnpm + turbo globally
pruner	base	turbo prune web --docker
installer	base	pnpm install --frozen-lockfile
builder	installer	next build (NEXT_PUBLIC_API_URL injected as ARG)
runner	node:22-slim	Copy .next/standalone + static + public; node server.js

ℹ  Both builds use turbo prune to produce the smallest possible dependency graph before installing, keeping image sizes small.

8.2 docker-compose.yml
services:
  api:
    build:
      context: .                          # monorepo root
      dockerfile: apps/api/Dockerfile
    container_name: weather_ai_api
    ports:
      - "3027:3000"
    restart: always
    env_file:
      - /home/apps/weather/api/.env       # live on host, not in repo
    networks: [app-network]
 
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    container_name: weather_ai_web
    ports:
      - "3028:3001"
    restart: always
    env_file:
      - /home/apps/weather/web/.env
    environment:
      - NODE_ENV=production
      - PORT=3001
      - HOSTNAME=0.0.0.0
    depends_on: [api]
    networks: [app-network]
 
networks:
  app-network:
    external: true                        # pre-created overlay network

8.3 Port mapping
Container	Internal port	Host port	Notes
weather_ai_api	3000	3027	NestJS API
weather_ai_web	3001	3028	Next.js SSR

8.4 Build & run
# 1. Create the external overlay network (once per host)
docker network create app-network
 
# 2. Place .env files on the host
#    /home/apps/weather/api/.env
#    /home/apps/weather/web/.env
 
# 3. Build and start everything
NEXT_PUBLIC_API_URL=http://weather_ai_api:3000/api/v1 \
  docker-compose up --build -d
 
# 4. Tail logs
docker-compose logs -f
 
# 5. Stop
docker-compose down

⚠  Inside Docker, the web container reaches the API via the container name: http://weather_ai_api:3000/api/v1. Set NEXT_PUBLIC_API_URL to the public-facing URL when serving the browser.


9. Turborepo Configuration
Tasks are defined in turbo.json at the monorepo root.

{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev":   { "cache": false, "persistent": true },
    "lint":  {},
    "test":  {}
  }
}

Command (from root)	What runs
pnpm dev	api + web in watch mode in parallel
pnpm build	api build → web build (respects ^build dependency)
pnpm lint	ESLint across all apps
pnpm test	Jest across all apps


10. Troubleshooting
Symptom	Likely cause	Fix
API returns 401	Invalid/missing WEATHER_API_KEY	Regenerate key in WeatherAI dashboard
API returns 403 on month/year	Free plan limit hit	Upgrade to Pro or Scale
API returns 503	WeatherAI or Nominatim unreachable	Check network; retry with backoff
"Destination not found" 400	Geocoding returned no results	Use a more specific name, e.g. "Nairobi, Kenya"
Web shows stale API URL	NEXT_PUBLIC_API_URL not set at build time	Pass as Docker ARG; rebuild the image
CORS error in browser	API CORS_ORIGINS missing web origin	Add web host to CORS_ORIGINS in api .env
pnpm install fails	Node / pnpm version mismatch	Use Node 22; run corepack enable first
Docker build fails at prune	turbo not installed in base stage	Confirm Dockerfile installs turbo globally


11. Full Environment Variable Reference
API (apps/api/.env)
Variable	Required	Example	Notes
PORT	Yes	3000	API listen port
NODE_ENV	Yes	production	development | production | test
WEATHER_API_KEY	Yes	wai_abc123	WeatherAI bearer token
HOST_NAME	No	0.0.0.0	Bind address (0.0.0.0 in Docker)
CORS_ORIGINS	No	https://app.com	Comma-separated production origins
CORS_DEV_ORIGINS	No	http://localhost:3001	Extra origins for dev mode

Web (apps/web/.env / build ARG)
Variable	Required	Example	Notes
NEXT_PUBLIC_API_URL	Yes	http://localhost:3000/api/v1	Must include /api/v1 suffix; build-time baked
PORT	No	3001	Runtime port (default 3001)
HOSTNAME	No	0.0.0.0	Bind address in standalone mode
NODE_ENV	No	production	Set automatically in Docker runner stage


12. Contributing
1.	Fork the repository and create a feature branch off main.
2.	Run pnpm install at the monorepo root.
3.	Make your changes; follow the existing snake_case naming convention.
4.	Add or update tests; ensure pnpm test passes.
5.	Run pnpm lint — zero warnings policy.
6.	Open a pull request with a clear description and link to any WeatherAI docs if relevant.

13. Licence
MIT © 2026 Skies & Places contributors

Built for the WeatherAI API Technical Assessment — weather-ai.co

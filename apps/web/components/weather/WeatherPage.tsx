'use client';

import { useState, useCallback } from 'react';
import { ForecastPeriod, IWeatherSearchResult, WeatherUnits } from '@/types/weather.types';
import { searchWeatherByDestination, getWeatherByCoordinates } from '@/services/weather.service';

import { CloudSun } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ForecastControls } from './ForecastControls';
import { WeatherEmpty, WeatherError, WeatherLoading } from './WeatherStates';
import { CurrentWeatherCard } from './Currentweathercard';
import { AISummary } from './AISummary';
import { HourlyHighlights } from './Hourlyhighlights';
import { WeatherDetails } from './WeatherDetails';
import { WeatherStats } from './WeatherStats';
import { toast } from 'sonner';
import { DailyForecast } from './Dailyforecast';

type UIState = 'idle' | 'loading' | 'success' | 'error';

export default function WeatherPage() {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState<IWeatherSearchResult | null>(null);
  const [period, setPeriod] = useState<ForecastPeriod>('week');
  const [units, setUnits] = useState<WeatherUnits>('metric');
  const [lastQuery, setLastQuery] = useState('');

  const fetchWeather = useCallback(
    async (destination: string, p: ForecastPeriod = period, u: WeatherUnits = units) => {
      setUiState('loading');
      setErrorMsg('');
      setLastQuery(destination);

      const result = await searchWeatherByDestination({
        destination,
        period: p,
        units: u,
        ai: true,
      });

      if (result.success && result.data) {
        setData(result.data);
        setUiState('success');
      } else {
        setErrorMsg(result.message || 'Could not fetch weather data.');
        setUiState('error');
      }
    },
    [period, units],
  );

  const handlePeriodChange = (p: ForecastPeriod) => {
    setPeriod(p);
    if (lastQuery) fetchWeather(lastQuery, p, units);
  };

  const handleUnitsChange = (u: WeatherUnits) => {
    setUnits(u);
    if (lastQuery) fetchWeather(lastQuery, period, u);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error( 'Geolocation not supported');
      return;
    }
    setUiState('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const result = await getWeatherByCoordinates({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          units,
          ai: true,
        });
        if (result.success && result.data) {
          setData(result.data);
          setLastQuery(result.data.destination);
          setUiState('success');
        } else {
          setErrorMsg(result.message || 'Could not fetch weather data.');
          setUiState('error');
        }
      },
      () => {
        setErrorMsg('Location access denied. Please search manually.');
        setUiState('error');
      },
    );
  };

  const isLoading = uiState === 'loading';

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <CloudSun size={20} className="text-foreground shrink-0" />
            <span className="text-sm font-bold tracking-tight text-foreground">Skye Weather</span>
          </div>
          <SearchBar
            onSearch={(dest) => fetchWeather(dest)}
            onLocate={handleLocate}
            loading={isLoading}
            defaultValue={lastQuery}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-2xl mx-auto px-4 py-5 space-y-5 pb-12">
        {/* Controls — only show when there's data or we searched */}
        {(uiState === 'success' || (uiState !== 'idle' && lastQuery)) && (
          <ForecastControls
            period={period}
            units={units}
            onPeriodChange={handlePeriodChange}
            onUnitsChange={handleUnitsChange}
          />
        )}

        {/* State rendering */}
        {uiState === 'idle' && <WeatherEmpty />}
        {uiState === 'loading' && <WeatherLoading />}
        {uiState === 'error' && <WeatherError message={errorMsg} />}

        {uiState === 'success' && data && (
          <>
            {/* Current conditions */}
            <CurrentWeatherCard
              current={data.current}
              location={data.location}
              destination={data.destination}
              units={units}
            />

            {/* AI summary */}
            {data.summary && <AISummary summary={data.summary} />}

            {/* Hourly highlights */}
            {data.hourly_highlights.length > 0 && (
              <HourlyHighlights hours={data.hourly_highlights} units={units} />
            )}

            {/* Current details from first hourly entry */}
            {data.hourly_highlights[0] && (
              <WeatherDetails hourly={data.hourly_highlights[0]} units={units} />
            )}

            {/* Daily forecast */}
            {data.forecast.length > 0 && (
              <DailyForecast forecast={data.forecast} units={units} />
            )}

            {/* Period stats */}
            <WeatherStats stats={data.stats} units={units} />

            {/* Footer attribution */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Data refreshed {new Date(data.current.time).toLocaleTimeString()} ·{' '}
              {data.location.timezone}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
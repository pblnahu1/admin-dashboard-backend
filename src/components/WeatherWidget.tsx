import { useEffect, useMemo, useState } from 'react';
import { Cloud, CloudRain, Snowflake, Sun } from 'lucide-react';

type Weather = {
  temp: number;
  code: number;
};

function iconFor(code: number) {
  // Simplified mapping for demo
  if ([0, 1].includes(code)) return <Sun className="w-5 h-5 text-yellow-500" />; // Clear
  if ([2, 3, 45, 48].includes(code)) return <Cloud className="w-5 h-5 text-slate-500" />; // Cloudy/Fog
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="w-5 h-5 text-blue-500" />; // Rain
  if ([71, 73, 75, 85, 86].includes(code)) return <Snowflake className="w-5 h-5 text-cyan-500" />; // Snow
  return <Cloud className="w-5 h-5 text-slate-500" />;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [units, setUnits] = useState<'c' | 'f'>(() => (localStorage.getItem('units') as 'c' | 'f') || 'c');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('units', units);
  }, [units]);

  useEffect(() => {
    let didCancel = false;

    async function load(lat: number, lon: number) {
      setLoading(true);
      try {
        const tempUnit = units === 'c' ? 'celsius' : 'fahrenheit';
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=${tempUnit}`;
        const res = await fetch(url);
        const json = await res.json();
        if (didCancel) return;
        const w = json.current_weather;
        setWeather({ temp: w.temperature, code: w.weathercode });
      } catch {
        if (!didCancel) setWeather(null);
      } finally {
        if (!didCancel) setLoading(false);
      }
    }

    function fallback() {
      // Buenos Aires fallback
      load(-34.61315, -58.37723);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => fallback(),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      fallback();
    }

    return () => {
      didCancel = true;
    };
  }, [units]);

  const tempLabel = useMemo(() => {
    if (!weather) return '-';
    return `${Math.round(weather.temp)}°${units.toUpperCase()}`;
  }, [weather, units]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white/60">
        {weather ? iconFor(weather.code) : <Cloud className="w-5 h-5 text-slate-400" />}
        <span className="text-sm font-medium text-slate-900">{loading ? '...' : tempLabel}</span>
      </div>
      <select
        value={units}
        onChange={(e) => setUnits(e.target.value as 'c' | 'f')}
        className="px-2 py-1.5 text-sm border border-slate-200 rounded-md bg-white/60"
        aria-label="Unidades de temperatura"
      >
        <option value="c">°C</option>
        <option value="f">°F</option>
      </select>
    </div>
  );
}

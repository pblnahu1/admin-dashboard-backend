import { useEffect, useMemo, useState } from 'react';
import { WeatherWidget } from './WeatherWidget';

export function TopBar() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatted = useMemo(() => {
    const d = now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
    const h = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${d} · ${h}`;
  }, [now]);

  return (
    <div className="z-30 border-b border-indigo-200 backdrop-blur bg-white/70">
      <div className="flex justify-between items-center px-6 py-3 mx-auto max-w-7xl">
        <div className="font-semibold text-slate-900">{formatted}</div>
        <WeatherWidget />
      </div>
    </div>
  );
}

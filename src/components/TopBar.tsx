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
    <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="text-slate-900 font-semibold">{formatted}</div>
        <WeatherWidget />
      </div>
    </div>
  );
}

import { memo } from 'react';

export const Footer = memo(function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          © {year} Hecho por Pablo. Todos los derechos reservados.
        </p>
        <div className="text-sm text-slate-500">
          Admin Dashboard • Supabase • React • TailwindCSS
        </div>
      </div>
    </footer>
  );
});

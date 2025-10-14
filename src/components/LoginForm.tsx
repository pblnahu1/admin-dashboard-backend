import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full [background:radial-gradient(100%_100%_at_50%_0%,rgb(255_255_255)_0%,rgb(248_250_252)_60%,rgb(241_245_249)_100%)]"></div>
      <div className="grid w-full max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        {/* Hero */}
        <section className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-6 md:p-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Lock className="h-4 w-4" />
              Seguridad de nivel empresarial
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">ProAdmin</h1>
            <p className="mt-2 md:mt-3 text-base md:text-lg text-slate-200">Sistema moderno para gestionar inventario y catálogo con analíticas en tiempo real.</p>
            <ul className="mt-4 md:mt-6 grid grid-cols-1 gap-3 text-slate-100/90">
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span> Gestión de productos ágil</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-sky-400"></span> Sincronizado con Supabase</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-violet-400"></span> Interfaz responsive y accesible</li>
            </ul>
          </div>
        </section>

        {/* Login Card */}
        <div className="w-full md:justify-self-end">
          <div className="rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Iniciar Sesión</h2>
              <p className="mt-2 text-slate-600">Accedé para administrar tu inventario</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-slate-900"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-slate-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              <p>Usá las credenciales que te otorgaron para acceder al dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

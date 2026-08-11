import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  User,
  AlertCircle,
  CheckCircle,
  Lock,
} from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
];

const AVAILABLE_THEMES = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export const ProfileSection = () => {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('es');
  const [preferredTheme, setPreferredTheme] = useState('light');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userMetadata = user?.user_metadata as Record<string, any> | undefined;

  useEffect(() => {
    if (!user) return;

    setEmail(user.email ?? '');
    setFullName(userMetadata?.full_name ?? '');
    setAvatarUrl(userMetadata?.avatar_url ?? '');
    setPreferredLanguage(userMetadata?.preferred_language ?? 'es');
    setPreferredTheme(userMetadata?.preferred_theme ?? 'light');
    setMessage(null);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStats = async () => {
    if (!user?.id) {
      setStats({ totalProducts: 0, activeProducts: 0, inactiveProducts: 0, lowStockProducts: 0 });
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('is_active, track_inventory, stock, low_stock_threshold')
      .eq('user_id', user.id);

    if (!error && data) {
      const lowStockProducts = data.filter((product) => {
        if (!product.track_inventory || product.stock === null) return false;
        const threshold = product.low_stock_threshold ?? 5;
        return product.stock > 0 && product.stock <= threshold;
      }).length;

      setStats({
        totalProducts: data.length,
        activeProducts: data.filter((p) => p.is_active).length,
        inactiveProducts: data.filter((p) => !p.is_active).length,
        lowStockProducts,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setMessage({ type: 'error', text: 'No se encontró sesión de usuario.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const userMetadataPayload = {
      full_name: fullName,
      avatar_url: avatarUrl,
      preferred_language: preferredLanguage,
      preferred_theme: preferredTheme,
    };

    const updatePayload: {
      email?: string;
      password?: string;
      user_metadata: Record<string, any>;
    } = {
      user_metadata: userMetadataPayload,
    };

    if (email !== user.email) {
      updatePayload.email = email;
    }

    if (newPassword) {
      updatePayload.password = newPassword;
    }

    const { error } = await supabase.auth.updateUser(updatePayload);

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setSaving(false);
      return;
    }

    await refreshUser();
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
    setSaving(false);
  };

  const avatarToShow = avatarUrl || userMetadata?.avatar_url || '';
  const lastSignIn = user?.last_sign_in_at || user?.identities?.[0]?.last_sign_in_at;
  const confirmedAt = (user as any)?.email_confirmed_at || (user as any)?.confirmed_at;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Administración del Perfil</h2>
        <p className="text-slate-600 mt-1">Actualiza tu cuenta, preferencias y seguridad desde un solo lugar.</p>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-2 ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
            }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 mb-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  {avatarToShow ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarToShow} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">{fullName || 'Administrador'}</h3>
                  <p className="text-sm text-slate-600">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Cuenta creada</p>
                <p className="mt-1 font-semibold text-slate-900">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Último inicio de sesión</p>
                <p className="mt-1 font-semibold text-slate-900">{lastSignIn ? formatDate(lastSignIn) : 'No disponible'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Verificación de email</p>
                <p className="mt-1 font-semibold text-slate-900">{confirmedAt ? 'Verificado' : 'Pendiente'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Preferencias</p>
                <p className="mt-1 font-semibold text-slate-900 capitalize">{preferredLanguage} / {preferredTheme}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Productos Totales</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Activos</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{stats.activeProducts}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Stock bajo</p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.lowStockProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Editar información</h3>
          <form className="space-y-5" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="fullName">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="avatarUrl">
                URL de avatar
              </label>
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="preferredLanguage">
                  Idioma preferido
                </label>
                <select
                  id="preferredLanguage"
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="preferredTheme">
                  Tema de la aplicación
                </label>
                <select
                  id="preferredTheme"
                  value={preferredTheme}
                  onChange={(event) => setPreferredTheme(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {AVAILABLE_THEMES.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-slate-700" />
                <div>
                  <h4 className="font-semibold text-slate-900">Seguridad de cuenta</h4>
                  <p className="text-sm text-slate-600">Actualiza tu contraseña cuando quieras reforzar el acceso.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="newPassword">
                    Nueva contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Dejar vacío para no cambiar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="confirmPassword">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Vuelve a escribir la nueva contraseña"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

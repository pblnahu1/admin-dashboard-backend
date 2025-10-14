import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShieldCheck, Menu } from 'lucide-react';

export const Header = ({ onToggleSidebar }: { onToggleSidebar?: () => void }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <div className="bg-slate-900 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="hidden sm:block text-sm text-slate-600">Sistema de Administración de Productos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-600">Administrador</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

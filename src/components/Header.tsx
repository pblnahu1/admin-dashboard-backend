import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShieldCheck, Menu } from 'lucide-react';

type Section = 'products' | 'profile';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeSection: Section;
  onChangeSection: (s: Section) => void;
}

export const Header = ({ onToggleSidebar, activeSection, onChangeSection }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="flex justify-between items-center px-4 py-4 md:px-8">
        <div className="flex gap-3 items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg md:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <div className="p-2 rounded-lg bg-slate-900">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold md:text-xl text-slate-900">ProAdmin</h1>
            <p className="hidden text-sm sm:block text-slate-600">Sistema de Administración de Inventario</p>
          </div>
        </div>

        {/* Desktop top-centered nav (buttons) */}
        <div className="hidden justify-center items-center bg-white border-b md:flex border-slate-200">
          <nav className="flex gap-3 items-center py-3">
            <button
              onClick={() => onChangeSection('products')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'products'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => onChangeSection('profile')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'profile'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Perfil
            </button>
          </nav>
        </div>

        <div className="flex gap-3 items-center md:gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-600">Administrador</p>
          </div>
          <button
            onClick={signOut}
            className="flex gap-2 items-center px-3 py-2 text-white rounded-lg transition-colors md:px-4 bg-slate-900 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

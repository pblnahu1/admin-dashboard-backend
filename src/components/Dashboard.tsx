import { useState } from 'react';
import { ProductsSection } from './ProductsSection';
import { ProfileSection } from './ProfileSection';
import { Header } from './Header';
import { Package, User } from 'lucide-react';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

type Section = 'products' | 'profile';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<Section>('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
      />
      

      

      <TopBar />

      <div className="flex">
        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 p-4 w-72 bg-white border-r border-slate-200 md:hidden">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveSection('products');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'products'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Productos</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('profile');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Perfil</span>
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Desktop sidebar removed; navigation moved to top bar for md+ */}

        <main className="flex-1 p-4 min-w-full md:min-w-0 md:p-8">
          {activeSection === 'products' && <ProductsSection />}
          {activeSection === 'profile' && <ProfileSection />}
        </main>
      </div>
      <Chatbot />
      <Footer />
    </div>
  );
}
;

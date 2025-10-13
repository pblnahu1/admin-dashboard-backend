import { useState } from 'react';
import { ProductsSection } from './ProductsSection';
import { ProfileSection } from './ProfileSection';
import { Header } from './Header';
import { Package, User } from 'lucide-react';

type Section = 'products' | 'profile';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<Section>('products');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveSection('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'products'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Products</span>
            </button>

            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'profile'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeSection === 'products' && <ProductsSection />}
          {activeSection === 'profile' && <ProfileSection />}
        </main>
      </div>
    </div>
  );
};

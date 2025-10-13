import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export const ProfileSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from('products').select('is_active');

    if (data) {
      setStats({
        totalProducts: data.length,
        activeProducts: data.filter((p) => p.is_active).length,
        inactiveProducts: data.filter((p) => !p.is_active).length,
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

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Admin Profile</h2>
        <p className="text-slate-600 mt-1">Manage your account information and view statistics</p>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <User className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="font-semibold text-slate-900">Total Products</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
          <p className="text-sm text-slate-600 mt-1">In your catalog</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="font-semibold text-slate-900">Active Products</h3>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.activeProducts}</p>
          <p className="text-sm text-slate-600 mt-1">Currently visible</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <User className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="font-semibold text-slate-900">Inactive Products</h3>
          </div>
          <p className="text-3xl font-bold text-slate-700">{stats.inactiveProducts}</p>
          <p className="text-sm text-slate-600 mt-1">Currently hidden</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Administrator</h3>
            <p className="text-slate-600">Full system access</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <Mail className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">Email Address</p>
              <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <Calendar className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">Account Created</p>
              <p className="text-lg font-semibold text-slate-900">
                {user?.created_at ? formatDate(user.created_at) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <Shield className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">Role</p>
              <p className="text-lg font-semibold text-slate-900">Administrator</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <User className="w-6 h-6 text-slate-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">User ID</p>
              <p className="text-sm font-mono text-slate-900 break-all">{user?.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Account Information</h4>
          <p className="text-sm text-blue-800">
            Your account has full administrative privileges. You can create, update, and delete
            products, as well as manage all aspects of the product catalog.
          </p>
        </div>
      </div>
    </div>
  );
};

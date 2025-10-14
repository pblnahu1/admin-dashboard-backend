import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { ProductModal } from './ProductModal';
import { useAuth } from '../contexts/AuthContext';

export const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [slugFilter, setSlugFilter] = useState<'all' | string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, slugFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    if (!user?.id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term)
      );
    }

    if (slugFilter !== 'all') {
      filtered = filtered.filter((p) => p.slug === slugFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) =>
        statusFilter === 'active' ? p.is_active : !p.is_active
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (!user?.id) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      fetchProducts();
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleToggleActive = async (product: Product) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
      .eq('user_id', user.id);

    if (!error) {
      fetchProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    if (!confirm(`Delete ${selectedProducts.size} selected products?`)) return;
    if (!user?.id) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', Array.from(selectedProducts))
      .eq('user_id', user.id);

    if (!error) {
      setSelectedProducts(new Set());
      fetchProducts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Productos</h2>
          <p className="mt-1 text-slate-600">
            Gestioná tu catálogo de productos ({filteredProducts.length} items)
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex gap-2 items-center px-6 py-3 font-medium text-white rounded-lg transition-colors bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="p-6 mb-6 bg-white rounded-xl border shadow-sm border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, descripción, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-3 pr-4 pl-10 w-full rounded-lg border transition-all outline-none border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 rounded-lg border transition-all outline-none border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Sólo Activos</option>
            <option value="inactive">Sólo Inactivos</option>
          </select>

          <select
            value={slugFilter}
            onChange={(e) => setSlugFilter(e.target.value as any)}
            className="px-4 py-3 rounded-lg border transition-all outline-none border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">Todas las categorías (slug)</option>
            {Array.from(new Set(products.map((p) => p.slug))).map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        </div>

        {selectedProducts.size > 0 && (
          <div className="flex gap-4 items-center p-4 mt-4 rounded-lg bg-slate-50">
            <span className="text-sm font-medium text-slate-700">
              {selectedProducts.size} seleccionados
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Borrar Seleccionados</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="inline-block w-8 h-8 rounded-full border-4 animate-spin border-slate-300 border-t-slate-900"></div>
          <p className="mt-4 text-slate-600">Cargando Productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border shadow-sm border-slate-200">
          <Package className="mx-auto mb-4 w-16 h-16 text-slate-300" />
          <h3 className="mb-2 text-xl font-semibold text-slate-900">No se encontraron productos.</h3>
          <p className="mb-6 text-slate-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Ajustando tus filtros'
              : 'Empieza a agregar productos'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleCreate}
              className="inline-flex gap-2 items-center px-6 py-3 font-medium text-white rounded-lg transition-colors bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-5 h-5" />
              <span>Agrega tu primer producto</span>
            </button>
          )}
        </div>
      ) : (
        <>
        {/* Desktop/tablet table */}
        <div className="hidden overflow-hidden bg-white rounded-xl border shadow-sm md:block border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedProducts.size === filteredProducts.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-900">
                    Producto
                  </th>
                  <th className="hidden px-6 py-4 text-sm font-semibold text-left text-slate-900 md:table-cell">
                    Slug
                  </th>
                  <th className="hidden px-6 py-4 text-sm font-semibold text-left text-slate-900 sm:table-cell">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-900">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-900">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-right text-slate-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 items-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="object-cover w-12 h-12 rounded-lg"
                          />
                        ) : (
                          <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-slate-200">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <code className="px-2 py-1 text-sm rounded text-slate-600 bg-slate-100">
                        {product.slug}
                      </code>
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <span className="text-sm font-medium text-slate-900">
                        {product.sku ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.track_inventory ? (
                        <span
                          className={
                            (() => {
                              const stock = product.stock ?? 0;
                              const threshold = product.low_stock_threshold ?? 0;
                              if (stock === 0) return 'text-red-600 font-semibold';
                              if (threshold > 0 && stock <= threshold) return 'text-yellow-600 font-semibold';
                              return 'text-blue-600 font-semibold';
                            })()
                          }
                        >
                          {product.stock ?? 0}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          product.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {product.is_active ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 rounded-lg transition-colors hover:text-red-700 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
              <div className="flex gap-3 items-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="object-cover w-14 h-14 rounded-lg" />
                ) : (
                  <div className="flex justify-center items-center w-14 h-14 rounded-lg bg-slate-200">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-slate-900">{product.name}</p>
                  <p className="text-xs truncate text-slate-600">{product.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleSelectProduct(product.id)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>
                  <div className="text-slate-500">Precio</div>
                  <div className="font-semibold text-slate-900">${Number(product.price).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Stock</div>
                  <div className={(() => {
                    const stock = product.track_inventory ? (product.stock ?? 0) : null;
                    const threshold = product.low_stock_threshold ?? 0;
                    if (stock === null) return 'text-slate-500';
                    if (stock === 0) return 'text-red-600 font-semibold';
                    if (threshold > 0 && stock <= threshold) return 'text-yellow-600 font-semibold';
                    return 'text-blue-600 font-semibold';
                  })()}>
                    {product.track_inventory ? (product.stock ?? 0) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">SKU</div>
                  <div className="text-slate-900">{product.sku ?? '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Estado</div>
                  <div>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end items-center mt-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-3 py-2 text-sm rounded-lg transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-2 text-sm text-red-600 rounded-lg transition-colors hover:text-red-700 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

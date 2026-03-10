import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package, Sparkles, X } from 'lucide-react';
import { ProductModal } from './ProductModal';
import { ProductExportImport } from "./ProductExportImport";
import { useProductsSection } from './useProductsSection';

export const ProductsSection = () => {
  const {
    products,
    filteredProducts,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    slugFilter,
    setSlugFilter,
    selectedProduct,
    isModalOpen,
    selectedProducts,
    importStatus,
    importProgress,
    isAiMode,
    setIsAiMode,
    aiQuery,
    setAiQuery,
    aiExplanation,
    clearAiSearch,
    handleDelete,
    handleToggleActive,
    handleEdit,
    handleCreate,
    handleModalClose,
    toggleSelectProduct,
    toggleSelectAll,
    handleBulkDelete,
    handleImportProducts
  } = useProductsSection();

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

      <ProductExportImport
        products={products}
        onImport={handleImportProducts}
      />

      {importStatus !== 'idle' && (
        <div className="p-3 mb-4 text-xs bg-white rounded border border-slate-200 shadow-sm">
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-slate-800">
              Estado de importación
            </span>
            <span className="text-slate-500">
              {importProgress.processed} / {importProgress.total} productos procesados
            </span>
          </div>
          <div className="w-full h-2 mb-2 overflow-hidden bg-slate-100 rounded-full">
            <div
              className={`h-2 rounded-full ${importStatus === 'error'
                ? 'bg-red-500'
                : importStatus === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-slate-900'
                }`}
              style={{
                width:
                  importProgress.total > 0
                    ? `${Math.round((importProgress.processed / importProgress.total) * 100)}%`
                    : '0%',
              }}
            />
          </div>
          {importStatus === 'importing' && (
            <p className="text-slate-600">
              Importando en lotes para respetar los límites de Supabase...
            </p>
          )}
          {importStatus === 'completed' && importProgress.errors.length === 0 && (
            <p className="text-emerald-700">
              Importación completada sin errores.
            </p>
          )}
          {importProgress.errors.length > 0 && (
            <div className="mt-1">
              <p className="mb-1 font-semibold text-red-700">Batches con errores</p>
              <ul className="space-y-0.5 max-h-24 overflow-auto">
                {importProgress.errors.map((err, idx) => (
                  <li key={idx} className="text-red-700">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="p-6 mb-6 bg-white rounded-xl border shadow-sm border-slate-200">
        <div className="flex items-center gap-2 mb-4 mb-2">
          <button
            onClick={() => {
              setIsAiMode(!isAiMode);
              if (isAiMode) clearAiSearch();
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
              isAiMode 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isAiMode ? 'text-indigo-600' : 'text-slate-400'}`} />
            {isAiMode ? 'Desactivar Búsqueda Inteligente' : 'Búsqueda Inteligente ✨'}
          </button>
        </div>

        {isAiMode ? (
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-indigo-500" />
              <input
                type="text"
                placeholder="Ej: Mostrar productos sin stock, cuantos auriculares tengo..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="py-3 pr-10 pl-10 w-full rounded-lg border transition-all outline-none border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50/30"
              />
              {aiQuery && (
                <button 
                  onClick={clearAiSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {aiExplanation && (
              <div className="px-4 py-3 bg-indigo-50 text-indigo-800 text-sm rounded-lg border border-indigo-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{aiExplanation}</p>
              </div>
            )}
          </div>
        ) : (
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
        )}

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
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${product.is_active
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
                        className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
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

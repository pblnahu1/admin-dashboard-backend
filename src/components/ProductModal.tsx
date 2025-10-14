import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price: '',
    slug: '',
    is_active: true,
    sku: '',
    stock: '',
    track_inventory: false,
    low_stock_threshold: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        image_url: product.image_url || '',
        price: product.price.toString(),
        slug: product.slug,
        is_active: product.is_active,
        sku: product.sku || '',
        stock: product.stock != null ? String(product.stock) : '',
        track_inventory: product.track_inventory ?? false,
        low_stock_threshold: product.low_stock_threshold != null ? String(product.low_stock_threshold) : '',
      });
    }
  }, [product]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: product ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user?.id) {
      setError('Debes estar autenticado para guardar productos.');
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }

    // Parse inventory numbers (optional fields)
    const stockVal = formData.stock === '' ? null : parseInt(formData.stock, 10);
    const lowStockVal = formData.low_stock_threshold === '' ? null : parseInt(formData.low_stock_threshold, 10);

    if (stockVal != null && (isNaN(stockVal) || stockVal < 0)) {
      setError('El stock debe ser un número entero mayor o igual a 0');
      setLoading(false);
      return;
    }
    if (lowStockVal != null && (isNaN(lowStockVal) || lowStockVal < 0)) {
      setError('El umbral de stock bajo debe ser un número entero mayor o igual a 0');
      setLoading(false);
      return;
    }

    let uploadedImageUrl: string | null = product?.image_url || null;

    // Upload new image if a file has been selected
    if (imageFile) {
      const bucket = 'product-images';
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeSlug = (formData.slug || formData.name).toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const filePath = `${user.id}/${safeSlug}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, imageFile, { upsert: false, contentType: imageFile.type });

      if (uploadError) {
        setError(`Error subiendo la imagen: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      uploadedImageUrl = publicData.publicUrl || null;
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      image_url: uploadedImageUrl,
      price,
      slug: formData.slug.trim(),
      is_active: formData.is_active,
      sku: formData.sku.trim() || null,
      stock: stockVal,
      track_inventory: formData.track_inventory,
      low_stock_threshold: lowStockVal,
      ...(product ? {} : { created_by: user?.id, user_id: user?.id }),
    };

    let result;
    if (product) {
      result = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .eq('user_id', user?.id || '');
    } else {
      result = await supabase.from('products').insert([productData]);
    }

    if (result.error) {
      if (result.error.message.includes('duplicate key')) {
        setError('A product with this slug already exists');
      } else {
        setError(result.error.message);
      }
      setLoading(false);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
              placeholder="Ingresá el nombre de tu producto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none font-mono text-sm"
              placeholder="product-slug"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
              required
            />
            <p className="text-xs text-slate-600 mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Ingresá la descripción de tu producto"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Imagen
            </label>
            <input
              type="file"
              id="img-product" 
              name="imgproduct"
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                setImageFile(file || null);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
            />
            {(imageFile || formData.image_url) && (
              <div className="mt-3">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="SKU-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="track_inventory"
                checked={formData.track_inventory}
                onChange={(e) => setFormData((prev) => ({ ...prev, track_inventory: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="track_inventory" className="text-sm font-medium text-slate-700">
                Controlar inventario (stock)
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Umbral de stock bajo
              </label>
              <input
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
              className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              El producto está visible y activo
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

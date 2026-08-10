import { useState, useEffect, useRef } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { X, Save, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadProductImage, deleteProductImage } from '../../services/imageService';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Formato de archivo no soportado. Usa JPG, PNG o WebP.');
        return;
      }

      // Validar tamaño (máx 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('La imagen es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }

      setError('');
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      setError('Por favor ingrese un precio válido');
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
      try {
        setUploading(true);
        setUploadProgress(0);

        const result = await uploadProductImage({
          userId: user.id,
          productId: product?.id || 'new',
          file: imageFile,
          onProgress: (progress) => setUploadProgress(progress)
        });

        uploadedImageUrl = result.url;

        // Si hay una imagen anterior y es diferente a la nueva, eliminarla
        if (product?.image_url && product.image_url !== uploadedImageUrl) {
          try {
            const oldPath = product.image_url.split('/').slice(-2).join('/');
            await deleteProductImage(oldPath);
          } catch (error) {
            console.warn('No se pudo eliminar la imagen anterior:', error);
          }
        }
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setError('Error al subir la imagen. Por favor, inténtalo de nuevo.');
        setLoading(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
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

    try {
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
          throw new Error('Ya existe un producto con este slug');
        } else {
          throw result.error;
        }
      }

      onClose();
    } catch (error: any) {
      console.error('Error al guardar el producto:', error);
      setError(error.message || 'Error al guardar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white w-full h-full md:h-auto md:rounded-2xl shadow-2xl md:max-w-2xl md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading || uploading}
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
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
              disabled={loading || uploading}
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
              title="Solo letras minúsculas, números y guiones"
              required
              disabled={loading || uploading}
            />
            <p className="text-xs text-slate-600 mt-1">
              Identificador para URL (solo minúsculas, números y guiones)
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
              disabled={loading || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Imagen
              {uploading && (
                <span className="ml-2 text-xs text-blue-600">
                  Subiendo... {Math.round(uploadProgress)}%
                </span>
              )}
            </label>

            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {imageFile || formData.image_url ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="img-product"
                  name="imgproduct"
                  accept="image/jpeg, image/png, image/webp, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading || uploading}
                />
              </label>

              {(imageFile || formData.image_url) && !uploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Eliminar
                </button>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Formatos soportados: JPG, PNG, WebP. Tamaño máximo: 10MB
            </p>

            {(imageFile || formData.image_url) && (
              <div className="mt-3 relative">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                  alt="Vista previa"
                  className="w-full max-w-xs h-auto max-h-48 object-contain rounded-lg border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-3 rounded-full shadow-lg">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                  </div>
                )}
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
                disabled={loading || uploading}
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
                disabled={loading || uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stock: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="Cantidad en stock"
                disabled={!formData.track_inventory || loading || uploading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="track_inventory"
                checked={formData.track_inventory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    track_inventory: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
                disabled={loading || uploading}
              />
              <label
                htmlFor="track_inventory"
                className="ml-2 block text-sm text-slate-700"
              >
                Controlar inventario
              </label>
            </div>

            <div>
              <label
                htmlFor="low_stock_threshold"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Umbral de stock bajo
              </label>
              <input
                type="number"
                min="0"
                step="1"
                id="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    low_stock_threshold: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="Alerta cuando el stock sea menor a..."
                disabled={!formData.track_inventory || loading || uploading}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
              disabled={loading || uploading}
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-slate-700"
            >
              Producto activo (visible en la tienda)
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              disabled={loading || uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading || uploading}
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploading ? 'Subiendo imagen...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {product ? 'Guardar cambios' : 'Crear producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

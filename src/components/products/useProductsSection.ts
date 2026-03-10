import { useState, useEffect } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { simulateAiSearch } from './AiSearchHelper';

export const useProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [slugFilter, setSlugFilter] = useState<'all' | string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'completed' | 'error'>('idle');
  const [importProgress, setImportProgress] = useState<{ total: number; processed: number; errors: string[] }>({
    total: 0,
    processed: 0,
    errors: [],
  });
  
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, slugFilter, isAiMode, aiQuery]);

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

    // If AI Mode is on and there is a query, use the AI Search Helper exclusively
    if (isAiMode && aiQuery.trim() !== '') {
      const result = simulateAiSearch(aiQuery, products);
      setFilteredProducts(result.filteredProducts);
      setAiExplanation(result.explanation);
      return; // Skip standard filters
    }

    // Reset AI explanation if not searching with AI
    setAiExplanation('');

    // Standard Filters
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

  const clearAiSearch = () => {
    setAiQuery('');
    setAiExplanation('');
    setIsAiMode(false);
    // filterProducts will run on next render due to useEffect on aiQuery/isAiMode
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

  const handleImportProducts = async (importedProducts: Product[]) => {
    if (!user?.id) return;
    if (!importedProducts.length) return;

    const chunkSize = 100;
    const total = importedProducts.length;
    setImportStatus('importing');
    setImportProgress({ total, processed: 0, errors: [] });

    const errors: string[] = [];

    const chunks: Product[][] = [];
    for (let i = 0; i < total; i += chunkSize) {
      chunks.push(importedProducts.slice(i, i + chunkSize));
    }

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      try {
        const { error } = await supabase
          .from('products')
          .upsert(
            chunk.map((p) => ({
              ...p,
              user_id: user.id,
              is_active: p.is_active ?? true,
              created_at: p.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { onConflict: 'slug' }
          );

        if (error) {
          console.error('Error en batch de importación:', error);
          errors.push(`Error en batch ${index + 1}: ${error.message || 'Error desconocido'}`);
        }
      } catch (err: any) {
        console.error('Error al importar productos:', err);
        errors.push(`Error en batch ${index + 1}: ${err.message || 'Error desconocido'}`);
      }

      setImportProgress((prev) => ({
        ...prev,
        processed: Math.min(prev.processed + chunk.length, total),
        errors,
      }));
    }

    await fetchProducts();

    if (errors.length > 0) {
      setImportStatus('error');
    } else {
      setImportStatus('completed');
    }
  };

  return {
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
  };
};

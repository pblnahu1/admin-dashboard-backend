import { Product } from '../../lib/supabase';

export interface AiSearchResult {
  filteredProducts: Product[];
  explanation: string;
}

export function simulateAiSearch(query: string, allProducts: Product[]): AiSearchResult {
  const q = query.toLowerCase().trim();
  
  // Simulated "AI" understanding based on keywords
  
  // 1. Check for "sin stock" or "agotados"
  if (q.includes('sin stock') || q.includes('agotado') || q.includes('cero stock')) {
    const outOfStock = allProducts.filter(p => p.track_inventory && (p.stock === 0 || p.stock === null));
    return {
      filteredProducts: outOfStock,
      explanation: `Encontré ${outOfStock.length} productos que actualmente no tienen stock.`,
    };
  }
  
  // 2. Check for "poco stock" or "escaso"
  if (q.includes('poco stock') || q.includes('bajo stock') || q.includes('escaso')) {
    const lowStock = allProducts.filter(p => {
      if (!p.track_inventory || p.stock === null) return false;
      const threshold = p.low_stock_threshold ?? 5; // Default to 5 if not set
      return p.stock > 0 && p.stock <= threshold;
    });
    return {
      filteredProducts: lowStock,
      explanation: `Encontré ${lowStock.length} productos que están por debajo de su umbral de stock bajo.`,
    };
  }

  // 3. Check for "activos" vs "inactivos"
  if (q.includes('inactivos') || q.includes('ocultos') || q.includes('pausados')) {
    const inactive = allProducts.filter(p => !p.is_active);
    return {
      filteredProducts: inactive,
      explanation: `Filtrando ${inactive.length} productos que están marcados como inactivos.`,
    };
  }
  
  if (q.includes('activos') || q.includes('publicados')) {
    const active = allProducts.filter(p => p.is_active);
    return {
      filteredProducts: active,
      explanation: `Mostrando ${active.length} productos actualmente activos.`,
    };
  }

  // 4. Quantity questions "cuantos" or "cantidad"
  if (q.includes('cuantos') || q.includes('cuántos') || q.includes('cantidad')) {
    // Try to extract a specific product name or category
    const searchTerms = q.replace(/cuantos|cuántos|cantidad|tengo|de|productos|hay/gi, '').trim();
    
    if (searchTerms.length > 2) {
      const matched = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerms) || 
        p.slug.toLowerCase().includes(searchTerms) ||
        p.description?.toLowerCase().includes(searchTerms)
      );
      
      const totalStock = matched.reduce((acc, p) => acc + (p.track_inventory ? (p.stock || 0) : 0), 0);
      
      return {
        filteredProducts: matched,
        explanation: `Encontré ${matched.length} productos relacionados a "${searchTerms}". Entre todos suman un stock total de ${totalStock} unidades.`,
      };
    }
    
    // General count
    const totalStock = allProducts.reduce((acc, p) => acc + (p.track_inventory ? (p.stock || 0) : 0), 0);
    return {
      filteredProducts: allProducts,
      explanation: `Tenés un total de ${allProducts.length} productos creados, sumando ${totalStock} unidades en stock (contando solo los que controlan inventario).`,
    };
  }
  
  // Fallback: General keyword search
  const matched = allProducts.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.slug.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.sku?.toLowerCase().includes(q)
  );
  
  return {
    filteredProducts: matched,
    explanation: matched.length > 0 
      ? `Encontré ${matched.length} resultados relacionados a tu búsqueda.` 
      : 'No pude encontrar productos que coincidan con lo que pedís. Probá con otras palabras.',
  };
}

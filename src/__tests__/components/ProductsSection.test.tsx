import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProductsSection } from '../../components/products/ProductsSection';
import { AuthProvider } from '../../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Mock de los datos de prueba
const mockProducts = [
  {
    id: '1',
    user_id: 'test-user-id',
    name: 'Producto de prueba',
    description: 'Descripción de prueba',
    price: 99.99,
    slug: 'producto-de-prueba',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

// Mock de Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockFrom = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockResolvedValue({ data: mockProducts, error: null });

  mockFrom.select = mockSelect;
  mockSelect.eq = mockEq;
  mockEq.order = mockOrder;

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
      auth: {
        onAuthStateChange: jest.fn(),
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }
        })
      }
    }))
  };
});

describe('ProductsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe cargar los productos al montar el componente', async () => {
    render(
      <AuthProvider>
        <ProductsSection />
      </AuthProvider>
    );

    // Verificar que se muestra el indicador de carga
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Esperar a que se carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
    });
  });

  it('debe filtrar productos por término de búsqueda', async () => {
    render(
      <AuthProvider>
        <ProductsSection />
      </AuthProvider>
    );

    // Esperar a que se carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
    });

    // Filtrar por término de búsqueda
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    fireEvent.change(searchInput, { target: { value: 'inexistente' } });

    // Verificar que no hay productos que coincidan
    expect(screen.queryByText('Producto de prueba')).not.toBeInTheDocument();
  });

  it('debe manejar la eliminación de un producto', async () => {
    // Mock de la función de confirmación
    window.confirm = jest.fn(() => true);

    const { from } = createClient();
    from().delete = jest.fn().mockReturnThis();
    from().delete().eq = jest.fn().mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <ProductsSection />
      </AuthProvider>
    );

    // Esperar a que se carguen los productos
    await waitFor(() => {
      expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
    });

    // Hacer clic en el botón de eliminar
    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(deleteButton);

    // Verificar que se llamó a la función de confirmación
    expect(window.confirm).toHaveBeenCalled();

    // Verificar que se llamó a la función de eliminación
    expect(from().delete).toHaveBeenCalled();
  });
});

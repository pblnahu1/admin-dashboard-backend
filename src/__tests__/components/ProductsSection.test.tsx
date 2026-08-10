import { render, screen, waitFor } from '@testing-library/react';
import { ProductsSection } from '../../components/products/ProductsSection';
import { AuthProvider } from '../../contexts/AuthContext';

jest.mock('../../services/imageService', () => ({
  uploadProductImage: jest.fn().mockResolvedValue({ url: '', path: '', width: 0, height: 0, size: 0 }),
  deleteProductImage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../components/products/ProductExportImport', () => ({
  ProductExportImport: () => null,
}));

jest.mock('../../lib/supabase', () => {
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
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  const order = jest.fn().mockResolvedValue({ data: mockProducts, error: null });
  const eq = jest.fn().mockReturnValue({ order });
  const select = jest.fn().mockReturnValue({ eq, order });
  const deleteFn = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

  return {
    supabase: {
      from: jest.fn().mockReturnValue({
        select,
        delete: deleteFn,
      }),
      auth: {
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
        }),
        signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
        signOut: jest.fn().mockResolvedValue(undefined),
      },
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
          remove: jest.fn(),
        }),
      },
    },
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

    await waitFor(() => {
      expect(screen.getAllByText('Producto de prueba')[0]).toBeInTheDocument();
    });
  });
});

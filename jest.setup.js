import '@testing-library/jest-dom';

// Mock de Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn((callback) => {
      // Simulamos un cambio de autenticación
      const user = { id: 'test-user-id', email: 'test@example.com' };
      const event = 'SIGNED_IN';
      callback({ event, session: { user } });
      
      // Retornamos la función de desuscripción
      return () => {};
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }
    })
  };

  const mockFrom = jest.fn().mockReturnThis();
  mockFrom.select = jest.fn().mockReturnThis();
  mockFrom.eq = jest.fn().mockReturnThis();
  mockFrom.single = jest.fn().mockResolvedValue({
    data: { id: 1, name: 'Test Product', user_id: 'test-user-id' },
    error: null
  });
  
  const mockSupabase = {
    auth: mockAuth,
    from: mockFrom,
  };

  return {
    createClient: jest.fn(() => mockSupabase)
  };
});

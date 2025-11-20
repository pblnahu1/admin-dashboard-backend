import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { act } from 'react-dom/test-utils';
import React from 'react';

// Mock de React para probar el hook
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>User: {user.email}</div>;
  return <div>No user</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should provide user context', async () => {
    // Renderizamos el componente con el proveedor de autenticación
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verificamos que inicialmente está cargando
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Esperamos a que se resuelva la autenticación
    await waitFor(() => {
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    });
  });

  it('should handle sign in', async () => {
    // Necesitamos renderizar el proveedor para que el hook funcione
    let signInFunction: any;
    
    const TestSignIn = () => {
      const { signIn } = useAuth();
      signInFunction = signIn;
      return null;
    };

    render(
      <AuthProvider>
        <TestSignIn />
      </AuthProvider>
    );
    
    // Simulamos un inicio de sesión exitoso
    const { error } = await signInFunction('test@example.com', 'password');
    
    expect(error).toBeNull();
    // Verificamos que se llamó a signInWithPassword con los argumentos correctos
    expect(createClient().auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle sign out', async () => {
    // Necesitamos renderizar el proveedor para que el hook funcione
    let signOutFunction: any;
    
    const TestSignOut = () => {
      const { signOut } = useAuth();
      signOutFunction = signOut;
      return null;
    };

    render(
      <AuthProvider>
        <TestSignOut />
      </AuthProvider>
    );
    
    await signOutFunction();
    
    // Verificamos que se llamó a signOut
    expect(createClient().auth.signOut).toHaveBeenCalled();
  });
});

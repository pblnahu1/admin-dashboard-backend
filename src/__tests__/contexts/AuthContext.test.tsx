import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { applyUserPreferences, buildProfileUpdatePayload } from '../../lib/userPreferences';

const TestComponent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <div>User: {user.email}</div>;
  return <div>No user</div>;
};

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue(undefined),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
      }),
    },
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide user context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    });
  });

  it('should apply preferred language and theme to the document', () => {
    const user = {
      user_metadata: {
        preferred_language: 'en',
        preferred_theme: 'dark',
      },
    } as { user_metadata: { preferred_language: string; preferred_theme: string } };

    document.documentElement.lang = '';
    document.documentElement.classList.remove('dark');

    applyUserPreferences(user);

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should build a profile update payload using Supabase data field', () => {
    const payload = buildProfileUpdatePayload({
      fullName: 'Ana García',
      email: 'ana@example.com',
      avatarUrl: 'https://example.com/avatar.png',
      preferredLanguage: 'en',
      preferredTheme: 'dark',
      currentEmail: 'ana@example.com',
    });

    expect(payload.data).toEqual({
      full_name: 'Ana García',
      avatar_url: 'https://example.com/avatar.png',
      preferred_language: 'en',
      preferred_theme: 'dark',
    });
    expect(payload.email).toBeUndefined();
  });
});

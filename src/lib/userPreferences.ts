export type UserPreferences = {
  preferred_language?: string;
  preferred_theme?: string;
};

export const applyUserPreferences = (user: { user_metadata?: UserPreferences } | null) => {
  const metadata = user?.user_metadata ?? {};
  const language = metadata.preferred_language ?? 'es';
  const theme = metadata.preferred_theme ?? 'light';

  document.documentElement.lang = language;
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);

  if (theme === 'dark') {
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.style.colorScheme = 'light';
  }

  return { language, theme };
};

export const buildProfileUpdatePayload = ({
  fullName,
  email,
  avatarUrl,
  preferredLanguage,
  preferredTheme,
  currentEmail,
}: {
  fullName: string;
  email: string;
  avatarUrl: string;
  preferredLanguage: string;
  preferredTheme: string;
  currentEmail?: string;
}) => {
  const payload: {
    email?: string;
    password?: string;
    data: {
      full_name: string;
      avatar_url: string;
      preferred_language: string;
      preferred_theme: string;
    };
  } = {
    data: {
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim(),
      preferred_language: preferredLanguage,
      preferred_theme: preferredTheme,
    },
  };

  const normalizedEmail = email.trim();
  if (normalizedEmail && normalizedEmail !== currentEmail?.trim()) {
    payload.email = normalizedEmail;
  }

  return payload;
};

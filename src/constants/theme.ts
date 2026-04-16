export const AppTheme = {
  colors: {
    bg: '#050505',
    bgSoft: '#111111',
    card: '#171717',
    cardAlt: '#1f1f1f',
    border: '#2e2e2e',
    text: '#ffffff',
    textMuted: '#b5b5b5',
    accent: '#ef4444',
    accentStrong: '#dc2626',
    success: '#10b981',
    danger: '#f43f5e',
  },
  gradients: {
    background: ['#050505', '#111111'] as const,
    card: ['#1a1a1a', '#101010'] as const,
    accent: ['#ef4444', '#991b1b'] as const,
    neutral: ['#2a2a2a', '#171717'] as const,
  },
};

export const Colors = {
  light: {
    text: '#111111',
    background: '#ffffff',
    tint: AppTheme.colors.accent,
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: AppTheme.colors.accent,
  },
  dark: {
    text: AppTheme.colors.text,
    background: AppTheme.colors.bg,
    tint: AppTheme.colors.accent,
    icon: AppTheme.colors.textMuted,
    tabIconDefault: AppTheme.colors.textMuted,
    tabIconSelected: AppTheme.colors.accent,
  },
};

export const theme = {
  colors: {
    // Primary - Azul moderno e profissional
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
    primaryLighter: '#60a5fa',
    primaryGradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    
    // Secondary - Verde para ações positivas
    secondary: '#10b981',
    secondaryDark: '#059669',
    secondaryLight: '#34d399',
    
    // Status colors - Mais suaves e profissionais
    danger: '#ef4444',
    dangerDark: '#dc2626',
    dangerLight: '#f87171',
    warning: '#f59e0b',
    warningDark: '#d97706',
    success: '#10b981',
    successDark: '#059669',
    info: '#3b82f6',
    
    // Neutrals - Escala de cinza moderna
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    border: '#e2e8f0',
    borderDark: '#cbd5e1',
    borderLight: '#f1f5f9',
    
    // Overlays
    overlay: 'rgba(15, 23, 42, 0.6)',
    overlayLight: 'rgba(15, 23, 42, 0.4)',
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
    xxxl: '4rem',    // 64px
  },
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.25rem', // 20px
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    toast: 1200,
    tooltip: 1300,
  },
};

export type Theme = typeof theme;



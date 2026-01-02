import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      primaryLight: string;
      primaryLighter: string;
      primaryGradient: string;
      secondary: string;
      secondaryDark: string;
      secondaryLight: string;
      danger: string;
      dangerDark: string;
      dangerLight: string;
      warning: string;
      warningDark: string;
      success: string;
      successDark: string;
      info: string;
      background: string;
      backgroundSecondary: string;
      surface: string;
      surfaceElevated: string;
      text: string;
      textSecondary: string;
      textTertiary: string;
      border: string;
      borderDark: string;
      borderLight: string;
      overlay: string;
      overlayLight: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      full: string;
    };
    shadows: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      inner: string;
      none: string;
    };
    typography: {
      fontFamily: {
        sans: string[];
        mono: string[];
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
      };
      fontWeight: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    zIndex: {
      dropdown: number;
      modal: number;
      toast: number;
      tooltip: number;
    };
  }
}

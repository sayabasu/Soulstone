export type ColorToken = 'primary' | 'secondary' | 'accent' | 'background' | 'foreground';

type ColorScale = Record<ColorToken, string>;

export const colorPalette: ColorScale = {
  primary: '#5B3FFF',
  secondary: '#FF8A3D',
  accent: '#2BC5B4',
  background: '#FFFFFF',
  foreground: '#1D1A2B',
};

export interface SpacingScale {
  xxxs: string;
  xxs: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
}

export const spacing: SpacingScale = {
  xxxs: '0.125rem',
  xxs: '0.25rem',
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
  xxxl: '4rem',
};

export const getSpacing = (token: keyof SpacingScale) => spacing[token];

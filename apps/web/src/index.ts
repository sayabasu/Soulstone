import { env } from '@soulstone/config';
import { colorPalette, getSpacing } from '@soulstone/ui';

export interface ThemeSnapshot {
  colors: typeof colorPalette;
  spacing: Record<string, string>;
  apiBaseUrl: string;
}

export const getThemeSnapshot = (): ThemeSnapshot => ({
  colors: colorPalette,
  spacing: {
    compact: getSpacing('xs'),
    comfortable: getSpacing('md'),
    spacious: getSpacing('xl'),
  },
  apiBaseUrl: env.DATABASE_URL,
});

if (import.meta.url === `file://${process.argv[1]}`) {
  const snapshot = getThemeSnapshot();
  // eslint-disable-next-line no-console
  console.log('Theme snapshot', snapshot);
}

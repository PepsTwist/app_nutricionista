// src/theme/themes.ts
import {
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
} from 'react-native-paper';
import { colors } from './colors';

export const LightTheme = {
  ...DefaultLightTheme,
  colors: {
    ...DefaultLightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surface,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    error: colors.error,
    elevation: {
      ...DefaultLightTheme.colors.elevation,
      level2: colors.surface,
    },
  },
};

export const DarkTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceVariant: colors.dark.surface,
    onSurface: colors.dark.text,
    onSurfaceVariant: colors.dark.textSecondary,
    error: colors.dark.error,
    elevation: {
      ...DefaultDarkTheme.colors.elevation,
      level2: colors.dark.surface,
    },
  },
};

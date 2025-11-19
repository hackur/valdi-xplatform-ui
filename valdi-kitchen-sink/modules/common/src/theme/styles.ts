/**
 * Common style definitions for Valdi Kitchen Sink
 * Reusable Style<> objects for consistency
 */

import { Style } from 'valdi_core/src/Style';
import { View, Label, Layout } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors } from './colors';
import { Fonts } from './fonts';

/**
 * Spacing scale (in points)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

/**
 * Border radius scale
 */
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/**
 * Common shadow definitions
 */
export const Shadows = {
  none: 'none',
  sm: `0 1 2 ${Colors.overlayLight}`,
  base: `0 2 4 ${Colors.overlayLight}`,
  md: `0 4 8 ${Colors.overlayLight}`,
  lg: `0 8 16 ${Colors.overlayLight}`,
  xl: `0 12 24 ${Colors.overlayLight}`,
  '2xl': `0 16 32 ${Colors.overlayLight}`,
} as const;

/**
 * Common container styles
 */
export const CommonStyles = {
  // Page container
  page: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  }),

  // Safe area container (with padding)
  safeArea: new Style<Layout>({
    width: '100%',
    height: '100%',
    paddingTop: 50, // Status bar
    paddingBottom: 34, // Home indicator (iPhone X+)
  }),

  // Card containers
  card: new Style<View>({
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.base,
    boxShadow: Shadows.base,
    padding: Spacing.base,
  }),

  cardLarge: new Style<View>({
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    boxShadow: Shadows.md,
    padding: Spacing.lg,
  }),

  // Section containers
  section: new Style<Layout>({
    width: '100%',
    marginBottom: Spacing.lg,
  }),

  // Flex layouts
  row: new Style<Layout>({
    flexDirection: 'row',
    alignItems: 'center',
  }),

  rowBetween: new Style<Layout>({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  column: new Style<Layout>({
    flexDirection: 'column',
  }),

  center: new Style<Layout>({
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // Text styles
  h1: new Style<Label>({
    font: Fonts.h1,
    color: Colors.textPrimary,
  }),

  h2: new Style<Label>({
    font: Fonts.h2,
    color: Colors.textPrimary,
  }),

  h3: new Style<Label>({
    font: Fonts.h3,
    color: Colors.textPrimary,
  }),

  body: new Style<Label>({
    font: Fonts.body,
    color: Colors.textPrimary,
  }),

  bodySecondary: new Style<Label>({
    font: Fonts.body,
    color: Colors.textSecondary,
  }),

  caption: new Style<Label>({
    font: Fonts.caption,
    color: Colors.textSecondary,
  }),

  // Border styles
  border: new Style<View>({
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  borderTop: new Style<View>({
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  // Divider
  divider: new Style<View>({
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
  }),
} as const;

/**
 * Animation curves
 */
export const AnimationCurves = {
  linear: 'linear',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  easeInOut: 'easeInOut',
} as const;

/**
 * Common animation durations (in seconds)
 */
export const AnimationDurations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

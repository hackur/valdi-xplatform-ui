/**
 * Typography System for Valdi AI UI
 *
 * Defines font families, sizes, weights, and complete typography styles.
 * Based on a modular scale for consistent visual hierarchy.
 */

/**
 * Font Families
 */
export const FontFamilies = {
  system: 'System', // System default (SF Pro on iOS, Roboto on Android)
  systemBold: 'System-Bold',
  systemSemibold: 'System-Semibold',
  systemMedium: 'System-Medium',
  systemLight: 'System-Light',

  // Monospace for code
  mono: 'Menlo', // Monospace font for code blocks
  monoAndroid: 'monospace', // Android monospace fallback
} as const;

/**
 * Font Sizes (in points)
 * Based on a modular scale (1.125 ratio)
 */
export const FontSizes = {
  xs: 12, // Extra small
  sm: 14, // Small
  base: 16, // Base/body text
  md: 18, // Medium
  lg: 20, // Large
  xl: 24, // Extra large
  xxl: 28, // 2X large
  xxxl: 32, // 3X large
  huge: 40, // Huge
} as const;

/**
 * Font Weights
 */
export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Line Heights (multipliers of font size)
 */
export const LineHeights = {
  tight: 1.2, // Tight leading
  normal: 1.5, // Normal leading
  relaxed: 1.75, // Relaxed leading
  loose: 2.0, // Loose leading
} as const;

/**
 * Complete Typography Styles
 *
 * These combine font family, size, weight, and line height
 * into complete text styles ready to use in components.
 */
export const Fonts = {
  // Headings
  h1: {
    fontFamily: FontFamilies.systemBold,
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
  },

  h2: {
    fontFamily: FontFamilies.systemBold,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
  },

  h3: {
    fontFamily: FontFamilies.systemBold,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.normal,
  },

  h4: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },

  h5: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },

  h6: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },

  // Body Text
  body: {
    fontFamily: FontFamilies.system,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },

  bodyLarge: {
    fontFamily: FontFamilies.system,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },

  bodySmall: {
    fontFamily: FontFamilies.system,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },

  // Body variants
  bodyMedium: {
    fontFamily: FontFamilies.systemMedium,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
  },

  bodySemibold: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },

  bodyBold: {
    fontFamily: FontFamilies.systemBold,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.normal,
  },

  // Captions & Labels
  caption: {
    fontFamily: FontFamilies.system,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },

  captionMedium: {
    fontFamily: FontFamilies.systemMedium,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
  },

  captionBold: {
    fontFamily: FontFamilies.systemBold,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.normal,
  },

  overline: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
  },

  // Buttons
  button: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.tight,
  },

  buttonSmall: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.tight,
  },

  buttonLarge: {
    fontFamily: FontFamilies.systemSemibold,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.tight,
  },

  // Code
  code: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.relaxed,
  },

  codeBlock: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.relaxed,
  },

  // Chat specific
  chatMessage: {
    fontFamily: FontFamilies.system,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },

  chatTimestamp: {
    fontFamily: FontFamilies.system,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },

  chatSenderName: {
    fontFamily: FontFamilies.systemMedium,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
  },
} as const;

/**
 * Font utility type
 */
export type FontStyle = (typeof Fonts)[keyof typeof Fonts];
export type FontSizeKey = keyof typeof FontSizes;
export type FontWeightKey = keyof typeof FontWeights;

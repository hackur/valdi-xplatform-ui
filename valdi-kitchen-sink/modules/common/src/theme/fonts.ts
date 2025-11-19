/**
 * Typography system for Valdi Kitchen Sink
 * Defines consistent font styles across the app
 */

import { systemFont, systemBoldFont, systemItalicFont } from 'valdi_core/src/SystemFont';

/**
 * Font size scale
 */
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
} as const;

/**
 * Font weight names (for reference)
 */
export const FontWeights = {
  regular: 'Regular',
  medium: 'Medium',
  semibold: 'Semibold',
  bold: 'Bold',
} as const;

/**
 * Pre-configured font strings for common use cases
 * Format: "FontName-Weight size [unscaled]"
 */
export const Fonts = {
  // Headers
  h1: systemBoldFont(FontSizes['3xl']),        // Bold 28pt
  h2: systemBoldFont(FontSizes['2xl']),        // Bold 24pt
  h3: systemBoldFont(FontSizes.xl),            // Bold 20pt
  h4: systemFont(FontSizes.lg, 'Semibold'),    // Semibold 18pt
  h5: systemFont(FontSizes.base, 'Semibold'),  // Semibold 16pt
  h6: systemFont(FontSizes.sm, 'Semibold'),    // Semibold 14pt

  // Body text
  bodyLarge: systemFont(FontSizes.lg),         // Regular 18pt
  body: systemFont(FontSizes.base),            // Regular 16pt
  bodySmall: systemFont(FontSizes.sm),         // Regular 14pt

  // Caption and helper text
  caption: systemFont(FontSizes.sm),           // Regular 14pt
  captionSmall: systemFont(FontSizes.xs),      // Regular 12pt

  // Button text
  button: systemFont(FontSizes.base, 'Semibold'), // Semibold 16pt
  buttonSmall: systemFont(FontSizes.sm, 'Semibold'), // Semibold 14pt

  // Code/monospace (use system font as placeholder)
  code: systemFont(FontSizes.sm),              // Regular 14pt
  codeSmall: systemFont(FontSizes.xs),         // Regular 12pt

  // Labels
  label: systemFont(FontSizes.base, 'Medium'), // Medium 16pt
  labelSmall: systemFont(FontSizes.sm, 'Medium'), // Medium 14pt
} as const;

/**
 * Line height multipliers (as reference for custom AttributedText)
 */
export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2.0,
} as const;

/**
 * Letter spacing values (in points)
 */
export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1.0,
} as const;

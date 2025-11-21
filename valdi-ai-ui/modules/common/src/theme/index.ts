/**
 * Theme System - Main Export
 *
 * Central export for all theme-related values:
 * - Colors
 * - Typography (Fonts)
 * - Spacing & Border Radius
 * - Shadows & Elevation
 */

// Import all theme values for the Theme object
import { Colors, ColorUtils } from './Colors';
import { Fonts, FontFamilies, FontSizes, FontWeights, LineHeights } from './Fonts';
import { Spacing, SemanticSpacing, BorderRadius, ChatBorderRadius, SpacingUtils } from './Spacing';
import { Shadows, SemanticShadows, ColoredShadows, ShadowUtils } from './Shadows';

// Export all from Colors
export * from './Colors';
export { Colors, ColorUtils };
export type { ColorKey } from './Colors';

// Export all from Fonts
export * from './Fonts';
export { Fonts, FontFamilies, FontSizes, FontWeights, LineHeights };
export type { FontStyle, FontSizeKey, FontWeightKey } from './Fonts';

// Export all from Spacing
export * from './Spacing';
export { Spacing, SemanticSpacing, BorderRadius, ChatBorderRadius, SpacingUtils };
export type { SpacingKey, SemanticSpacingKey, BorderRadiusKey } from './Spacing';

// Export all from Shadows
export * from './Shadows';
export { Shadows, SemanticShadows, ColoredShadows, ShadowUtils };
export type { ShadowStyle, ShadowKey, SemanticShadowKey, ColoredShadowKey } from './Shadows';

/**
 * Complete Theme Object
 *
 * Provides a single object containing all theme values
 * for easy access and consistent usage across the app.
 */
export const Theme = {
  colors: Colors,
  fonts: Fonts,
  spacing: Spacing,
  semanticSpacing: SemanticSpacing,
  borderRadius: BorderRadius,
  chatBorderRadius: ChatBorderRadius,
  shadows: Shadows,
  semanticShadows: SemanticShadows,
  coloredShadows: ColoredShadows,
} as const;

/**
 * Theme type export
 */
export type ThemeType = typeof Theme;

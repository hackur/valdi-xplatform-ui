/**
 * Style Helper Utilities
 *
 * Reusable style utility functions following SOLID, DRY, and KISS principles.
 * These helpers eliminate code duplication across components and provide
 * a consistent API for creating common style patterns.
 *
 * Benefits:
 * - Single Responsibility: Each helper has one clear purpose
 * - DRY: Eliminates duplicate style logic across components
 * - KISS: Simple, straightforward APIs that are easy to understand
 * - Type Safety: Full TypeScript support with proper types
 * - Consistency: Ensures uniform styling patterns across the app
 */

import { Style } from 'valdi_core/src/Style';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Standard size categories used across components
 */
export type SizeCategory = 'small' | 'medium' | 'large';

/**
 * Extended size categories with extra-large option
 */
export type ExtendedSizeCategory = SizeCategory | 'xlarge';

/**
 * Text alignment options
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Shadow/Elevation levels
 */
export type ElevationLevel = 'none' | 'sm' | 'md' | 'lg';

/**
 * Padding configuration object
 */
export interface PaddingConfig {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  padding?: number;
}

/**
 * Margin configuration object
 */
export interface MarginConfig {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  margin?: number;
}

// ============================================================================
// Font Helpers
// ============================================================================

/**
 * Creates a font string with the specified size and weight
 *
 * @param size - Font size in pixels
 * @param bold - Whether to use bold font (default: false)
 * @returns Font string for use in styles
 *
 * @example
 * const titleFont = createFont(18, true);
 * const bodyFont = createFont(14);
 */
export const createFont = (size: number, bold = false): string => {
  return bold ? systemBoldFont(size) : systemFont(size);
};

/**
 * Creates a complete Label style with font, color, and optional alignment
 *
 * @param fontSize - Font size in pixels
 * @param color - Text color
 * @param bold - Whether to use bold font (default: false)
 * @param align - Text alignment (optional)
 * @returns Style object for Label components
 *
 * @example
 * const titleStyle = createLabelStyle(18, Colors.textPrimary, true, 'center');
 * const bodyStyle = createLabelStyle(14, Colors.textSecondary);
 */
export const createLabelStyle = (
  fontSize: number,
  color: string,
  bold = false,
  align?: TextAlign
): Style<Label> => {
  return new Style<Label>({
    font: bold ? systemBoldFont(fontSize) : systemFont(fontSize),
    color,
    ...(align ? { textAlign: align } : {}),
  });
};

// ============================================================================
// View Helpers
// ============================================================================

/**
 * Creates a container style with optional dimensions and background
 *
 * @param width - Container width (number or string like '100%')
 * @param height - Container height (number or string)
 * @param backgroundColor - Background color (optional)
 * @param customStyle - Additional custom styles to merge
 * @returns Style object for View components
 *
 * @example
 * const containerStyle = createContainerStyle('100%', 200, Colors.surface);
 * const fixedBoxStyle = createContainerStyle(100, 100, Colors.primary);
 */
export const createContainerStyle = (
  width?: string | number,
  height?: string | number,
  backgroundColor?: string,
  customStyle?: Record<string, unknown>
): Style<View> => {
  return new Style<View>({
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
    ...customStyle,
  });
};

/**
 * Creates a centered container style
 *
 * @param width - Container width (optional)
 * @param height - Container height (optional)
 * @param customStyle - Additional custom styles to merge
 * @returns Style object for centered View components
 *
 * @example
 * const centeredStyle = createCenteredContainerStyle(200, 200);
 */
export const createCenteredContainerStyle = (
  width?: string | number,
  height?: string | number,
  customStyle?: Record<string, unknown>
): Style<View> => {
  return new Style<View>({
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    alignItems: 'center',
    justifyContent: 'center',
    ...customStyle,
  });
};

/**
 * Creates a flex container style
 *
 * @param direction - Flex direction ('row' or 'column')
 * @param alignItems - Align items value (default: 'stretch')
 * @param justifyContent - Justify content value (default: 'flex-start')
 * @param customStyle - Additional custom styles to merge
 * @returns Style object for flex View components
 *
 * @example
 * const rowStyle = createFlexContainerStyle('row', 'center', 'space-between');
 * const columnStyle = createFlexContainerStyle('column');
 */
export const createFlexContainerStyle = (
  direction: 'row' | 'column' = 'row',
  alignItems: string = 'stretch',
  justifyContent: string = 'flex-start',
  customStyle?: Record<string, unknown>
): Style<View> => {
  return new Style<View>({
    flexDirection: direction,
    alignItems,
    justifyContent,
    ...customStyle,
  });
};

// ============================================================================
// Size Helpers
// ============================================================================

/**
 * Maps a size category to a specific value from provided options
 *
 * @param size - Size category ('small', 'medium', 'large')
 * @param values - Tuple of [small, medium, large] values
 * @returns The value corresponding to the size category
 *
 * @example
 * const width = getSizeValue('large', [32, 40, 48]); // Returns 48
 * const fontSize = getSizeValue('small', [12, 14, 16]); // Returns 12
 */
export const getSizeValue = (
  size: SizeCategory,
  values: [number, number, number]
): number => {
  const [small, medium, large] = values;
  switch (size) {
    case 'small':
      return small;
    case 'medium':
      return medium;
    case 'large':
      return large;
    default:
      return medium;
  }
};

/**
 * Maps an extended size category to a specific value
 *
 * @param size - Extended size category ('small', 'medium', 'large', 'xlarge')
 * @param values - Tuple of [small, medium, large, xlarge] values
 * @returns The value corresponding to the size category
 *
 * @example
 * const avatarSize = getExtendedSizeValue('xlarge', [32, 40, 48, 64]); // Returns 64
 */
export const getExtendedSizeValue = (
  size: ExtendedSizeCategory,
  values: [number, number, number, number]
): number => {
  const [small, medium, large, xlarge] = values;
  switch (size) {
    case 'small':
      return small;
    case 'medium':
      return medium;
    case 'large':
      return large;
    case 'xlarge':
      return xlarge;
    default:
      return medium;
  }
};

// ============================================================================
// Padding Helpers
// ============================================================================

/**
 * Creates padding configuration based on size category
 *
 * @param size - Size category ('small', 'medium', 'large')
 * @returns Padding configuration object
 *
 * @example
 * const padding = createPadding('medium');
 * // Returns { padding: 16 }
 */
export const createPadding = (size: SizeCategory): PaddingConfig => {
  const value = getSizeValue(size, [Spacing.sm, Spacing.base, Spacing.lg]);
  return { padding: value };
};

/**
 * Creates horizontal and vertical padding configuration
 *
 * @param size - Size category for mapping to spacing values
 * @returns Padding configuration with horizontal and vertical values
 *
 * @example
 * const padding = createHVPadding('medium');
 * // Returns { paddingHorizontal: 20, paddingVertical: 16 }
 */
export const createHVPadding = (size: SizeCategory): PaddingConfig => {
  const horizontalValues: [number, number, number] = [Spacing.base, Spacing.xl, Spacing.xxl];
  const verticalValues: [number, number, number] = [Spacing.sm, Spacing.md, Spacing.base];

  return {
    paddingHorizontal: getSizeValue(size, horizontalValues),
    paddingVertical: getSizeValue(size, verticalValues),
  };
};

/**
 * Creates custom padding configuration
 *
 * @param top - Top padding
 * @param right - Right padding
 * @param bottom - Bottom padding
 * @param left - Left padding
 * @returns Padding configuration object
 *
 * @example
 * const padding = createCustomPadding(8, 16, 8, 16);
 */
export const createCustomPadding = (
  top: number,
  right: number,
  bottom: number,
  left: number
): PaddingConfig => {
  return {
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  };
};

// ============================================================================
// Margin Helpers
// ============================================================================

/**
 * Creates margin configuration based on size category
 *
 * @param size - Size category ('small', 'medium', 'large')
 * @returns Margin configuration object
 *
 * @example
 * const margin = createMargin('small');
 * // Returns { margin: 8 }
 */
export const createMargin = (size: SizeCategory): MarginConfig => {
  const value = getSizeValue(size, [Spacing.sm, Spacing.base, Spacing.lg]);
  return { margin: value };
};

/**
 * Creates horizontal and vertical margin configuration
 *
 * @param size - Size category for mapping to spacing values
 * @returns Margin configuration with horizontal and vertical values
 *
 * @example
 * const margin = createHVMargin('large');
 */
export const createHVMargin = (size: SizeCategory): MarginConfig => {
  const horizontalValues: [number, number, number] = [Spacing.base, Spacing.xl, Spacing.xxl];
  const verticalValues: [number, number, number] = [Spacing.sm, Spacing.md, Spacing.base];

  return {
    marginHorizontal: getSizeValue(size, horizontalValues),
    marginVertical: getSizeValue(size, verticalValues),
  };
};

/**
 * Creates custom margin configuration
 *
 * @param top - Top margin
 * @param right - Right margin
 * @param bottom - Bottom margin
 * @param left - Left margin
 * @returns Margin configuration object
 *
 * @example
 * const margin = createCustomMargin(8, 16, 8, 16);
 */
export const createCustomMargin = (
  top: number,
  right: number,
  bottom: number,
  left: number
): MarginConfig => {
  return {
    marginTop: top,
    marginRight: right,
    marginBottom: bottom,
    marginLeft: left,
  };
};

// ============================================================================
// Border & Shadow Helpers
// ============================================================================

/**
 * Creates border configuration
 *
 * @param width - Border width
 * @param color - Border color
 * @param radius - Border radius (optional)
 * @returns Border configuration object
 *
 * @example
 * const border = createBorder(1, Colors.border, BorderRadius.md);
 */
export const createBorder = (
  width: number,
  color: string,
  radius?: number
): Record<string, unknown> => {
  return {
    borderWidth: width,
    borderColor: color,
    ...(radius !== undefined ? { borderRadius: radius } : {}),
  };
};

/**
 * Creates rounded border configuration
 *
 * @param size - Size category for border radius
 * @returns Border radius configuration
 *
 * @example
 * const rounded = createRoundedBorder('medium');
 * // Returns { borderRadius: 8 }
 */
export const createRoundedBorder = (size: SizeCategory): Record<string, number> => {
  const value = getSizeValue(size, [
    BorderRadius.sm,
    BorderRadius.md,
    BorderRadius.lg,
  ]);
  return { borderRadius: value };
};

/**
 * Gets shadow style based on elevation level
 *
 * @param elevation - Elevation level ('none', 'sm', 'md', 'lg')
 * @returns Shadow configuration object
 *
 * @example
 * const shadow = getShadowStyle('md');
 */
export const getShadowStyle = (elevation: ElevationLevel): Record<string, unknown> => {
  switch (elevation) {
    case 'none':
      return Shadows.none;
    case 'sm':
      return Shadows.sm;
    case 'md':
      return Shadows.md;
    case 'lg':
      return Shadows.lg;
    default:
      return Shadows.none;
  }
};

/**
 * Creates a card-style container with shadow and border radius
 *
 * @param backgroundColor - Background color
 * @param elevation - Shadow elevation level
 * @param borderRadius - Border radius value (optional)
 * @param customStyle - Additional custom styles
 * @returns Style object for card-like containers
 *
 * @example
 * const cardStyle = createCardStyle(Colors.surface, 'md', BorderRadius.lg);
 */
export const createCardStyle = (
  backgroundColor: string,
  elevation: ElevationLevel = 'sm',
  borderRadius?: number,
  customStyle?: Record<string, unknown>
): Style<View> => {
  return new Style<View>({
    backgroundColor,
    borderRadius: borderRadius ?? BorderRadius.md,
    ...getShadowStyle(elevation),
    ...customStyle,
  });
};

// ============================================================================
// Circle/Avatar Helpers
// ============================================================================

/**
 * Creates a circular container style
 *
 * @param size - Diameter of the circle
 * @param backgroundColor - Background color (optional)
 * @param customStyle - Additional custom styles
 * @returns Style object for circular View components
 *
 * @example
 * const circleStyle = createCircleStyle(40, Colors.primary);
 */
export const createCircleStyle = (
  size: number,
  backgroundColor?: string,
  customStyle?: Record<string, unknown>
): Style<View> => {
  return new Style<View>({
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...(backgroundColor ? { backgroundColor } : {}),
    ...customStyle,
  });
};

/**
 * Creates a circular image style
 *
 * @param size - Diameter of the circle
 * @returns Style object for circular images
 *
 * @example
 * const avatarImageStyle = createCircleImageStyle(48);
 */
export const createCircleImageStyle = (size: number): Style<View> => {
  return new Style<View>({
    width: size,
    height: size,
    borderRadius: size / 2,
  });
};

// ============================================================================
// Common Component Style Helpers
// ============================================================================

/**
 * Creates a button-like style with padding, background, and border radius
 *
 * @param backgroundColor - Background color
 * @param textColor - Text color
 * @param size - Size category for padding
 * @param customStyle - Additional custom styles
 * @returns Style object for button-like containers
 *
 * @example
 * const btnStyle = createButtonStyle(Colors.primary, Colors.white, 'medium');
 */
export const createButtonStyle = (
  backgroundColor: string,
  textColor: string,
  size: SizeCategory = 'medium',
  customStyle?: Record<string, unknown>
): Style<View> => {
  const padding = createHVPadding(size);

  return new Style<View>({
    backgroundColor,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...padding,
    ...customStyle,
  });
};

/**
 * Creates styles for an interactive element (hover/press states)
 *
 * @param isPressed - Whether the element is currently pressed
 * @param normalOpacity - Normal state opacity (default: 1)
 * @param pressedOpacity - Pressed state opacity (default: 0.7)
 * @returns Opacity configuration
 *
 * @example
 * const interactiveStyle = createInteractiveStyle(isPressed);
 */
export const createInteractiveStyle = (
  isPressed: boolean,
  normalOpacity = 1,
  pressedOpacity = 0.7
): Record<string, number> => {
  return {
    opacity: isPressed ? pressedOpacity : normalOpacity,
  };
};

// ============================================================================
// Utility Style Combiners
// ============================================================================

/**
 * Merges multiple style objects into one
 *
 * @param styles - Array of style objects to merge
 * @returns Merged style object
 *
 * @example
 * const combinedStyle = mergeStyles([baseStyle, paddingStyle, colorStyle]);
 */
export const mergeStyles = (...styles: Array<Record<string, unknown> | undefined>): Record<string, unknown> => {
  return styles.reduce((acc, style) => {
    if (style) {
      return { ...acc, ...style };
    }
    return acc;
  }, {});
};

/**
 * Conditionally applies a style
 *
 * @param condition - Whether to apply the style
 * @param style - Style to apply if condition is true
 * @returns Style object or empty object
 *
 * @example
 * const style = conditionalStyle(isActive, { backgroundColor: Colors.primary });
 */
export const conditionalStyle = (
  condition: boolean,
  style: Record<string, unknown>
): Record<string, unknown> => {
  return condition ? style : {};
};

// ============================================================================
// Default Export (Optional - for convenience)
// ============================================================================

export const StyleHelpers = {
  // Font helpers
  createFont,
  createLabelStyle,

  // View helpers
  createContainerStyle,
  createCenteredContainerStyle,
  createFlexContainerStyle,

  // Size helpers
  getSizeValue,
  getExtendedSizeValue,

  // Padding helpers
  createPadding,
  createHVPadding,
  createCustomPadding,

  // Margin helpers
  createMargin,
  createHVMargin,
  createCustomMargin,

  // Border & shadow helpers
  createBorder,
  createRoundedBorder,
  getShadowStyle,
  createCardStyle,

  // Circle/Avatar helpers
  createCircleStyle,
  createCircleImageStyle,

  // Component helpers
  createButtonStyle,
  createInteractiveStyle,

  // Utility combiners
  mergeStyles,
  conditionalStyle,
} as const;

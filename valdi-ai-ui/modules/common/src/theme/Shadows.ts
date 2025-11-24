/**
 * Shadow and Elevation System for Valdi AI UI
 *
 * Provides consistent shadow/elevation styles based on Material Design
 * elevation principles, adapted for both iOS and Android.
 */

import { Colors } from './Colors';

/**
 * Shadow Configuration Interface
 */
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number; // Android elevation
}

/**
 * Elevation Levels (0-24)
 * Based on Material Design elevation system
 */
export const Shadows = {
  /**
   * Level 0 - No elevation
   * Use for: Surfaces at the app's base level
   */
  none: {
    shadowColor: Colors.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /**
   * Level 1 - Slight elevation
   * Use for: Cards resting on surface
   */
  xs: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },

  /**
   * Level 2 - Low elevation
   * Use for: Raised buttons, cards
   */
  sm: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  /**
   * Level 4 - Medium elevation
   * Use for: App bar, floating action button (resting)
   */
  base: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },

  /**
   * Level 6 - Medium-high elevation
   * Use for: Snackbar
   */
  md: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },

  /**
   * Level 8 - High elevation
   * Use for: Dialogs, pickers, floating action button (pressed)
   */
  lg: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  /**
   * Level 12 - Very high elevation
   * Use for: Dropdown menus
   */
  xl: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },

  /**
   * Level 16 - Extreme elevation
   * Use for: Modal sheets, navigation drawer
   */
  xxl: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },

  /**
   * Level 24 - Maximum elevation
   * Use for: Dialogs, modal overlays
   */
  max: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
} as const;

/**
 * Semantic Shadows
 * Meaningful names for specific UI components
 */
export const SemanticShadows = {
  card: Shadows.sm, // Cards
  cardHover: Shadows.md, // Cards on hover/press
  button: Shadows.xs, // Buttons
  buttonHover: Shadows.sm, // Buttons on hover/press
  messageBubble: Shadows.xs, // Chat message bubbles
  inputBar: Shadows.sm, // Input bar
  modal: Shadows.xxl, // Modal dialogs
  dropdown: Shadows.lg, // Dropdown menus
  floatingButton: Shadows.md, // Floating action button
  navigationBar: Shadows.base, // Navigation/app bar
  overlay: Shadows.max, // Full-screen overlays
} as const;

/**
 * Colored Shadows
 * For special effects (use sparingly)
 */
export const ColoredShadows = {
  /**
   * Primary colored glow
   */
  primaryGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  /**
   * Success colored glow
   */
  successGlow: {
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  /**
   * Error colored glow
   */
  errorGlow: {
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  /**
   * Warning colored glow
   */
  warningGlow: {
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

/**
 * Shadow utility functions
 *
 * Helper functions for creating and manipulating shadow styles.
 */
export const ShadowUtils = {
  /**
   * Create custom shadow with specific parameters
   *
   * Provides fine-grained control over shadow appearance.
   * Automatically calculates elevation from radius if not provided.
   *
   * @param color - The shadow color
   * @param offsetX - Horizontal offset in pixels
   * @param offsetY - Vertical offset in pixels
   * @param opacity - Shadow opacity (0-1)
   * @param radius - Blur radius in pixels
   * @param elevation - Android elevation (optional, defaults to radius * 2)
   * @returns A complete ShadowStyle object
   *
   * @example
   * ```typescript
   * const customShadow = ShadowUtils.custom(
   *   Colors.primary,
   *   0,
   *   4,
   *   0.3,
   *   8,
   *   4
   * );
   *
   * const style = new Style({
   *   ...customShadow,
   *   backgroundColor: Colors.surface
   * });
   * ```
   */
  custom(
    color: string,
    offsetX: number,
    offsetY: number,
    opacity: number,
    radius: number,
    elevation?: number,
  ): ShadowStyle {
    return {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation: elevation ?? Math.round(radius * 2),
    };
  },

  /**
   * Combine multiple shadow styles
   *
   * Merges multiple shadows by selecting the most prominent shadow for iOS
   * and the highest elevation for Android.
   *
   * @param shadows - Variable number of ShadowStyle objects to combine
   * @returns A combined ShadowStyle
   *
   * @example
   * ```typescript
   * const combined = ShadowUtils.combine(
   *   Shadows.sm,
   *   ColoredShadows.primaryGlow
   * );
   * ```
   *
   * @remarks
   * Note: iOS only supports one shadow per element, so this selects
   * the shadow with highest opacity. Android uses the maximum elevation.
   */
  combine(...shadows: ShadowStyle[]): ShadowStyle {
    // For Android, use the highest elevation
    const maxElevation = Math.max(...shadows.map((s) => s.elevation ?? 0));

    // For iOS, we can only use one shadow, so use the most prominent
    const prominentShadow = shadows.reduce((prev, current) =>
      (current.shadowOpacity ?? 0) > (prev.shadowOpacity ?? 0) ? current : prev,
    );

    return {
      ...prominentShadow,
      elevation: maxElevation,
    };
  },

  /**
   * Scale shadow intensity
   *
   * Multiplies shadow properties by a factor to increase or decrease intensity.
   * Useful for hover states or emphasis.
   *
   * @param shadow - The base shadow style
   * @param factor - The scaling factor (e.g., 1.5 for 50% more intense)
   * @returns A scaled ShadowStyle
   *
   * @example
   * ```typescript
   * // Create a more intense shadow on hover
   * const baseButton = Shadows.sm;
   * const hoverButton = ShadowUtils.scale(baseButton, 1.5);
   *
   * // Create a more subtle shadow
   * const subtleShadow = ShadowUtils.scale(Shadows.md, 0.5);
   * ```
   */
  scale(shadow: ShadowStyle, factor: number): ShadowStyle {
    return {
      ...shadow,
      shadowOpacity: Math.min(1, shadow.shadowOpacity * factor),
      shadowRadius: shadow.shadowRadius * factor,
      elevation: Math.round((shadow.elevation ?? 0) * factor),
    };
  },
};

/**
 * Type exports
 */
export type ShadowKey = keyof typeof Shadows;
export type SemanticShadowKey = keyof typeof SemanticShadows;
export type ColoredShadowKey = keyof typeof ColoredShadows;

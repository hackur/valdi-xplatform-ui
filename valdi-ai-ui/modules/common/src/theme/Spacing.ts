/**
 * Spacing System for Valdi AI UI
 *
 * Provides a consistent spacing scale based on a 4px grid system.
 * Use these values for padding, margins, gaps, and positioning.
 */

/**
 * Base Spacing Values (in pixels)
 * Based on 4px grid system
 */
export const Spacing = {
  none: 0, // No spacing
  xxs: 2, // Extra extra small
  xs: 4, // Extra small
  sm: 8, // Small
  md: 12, // Medium
  base: 16, // Base spacing (most common)
  lg: 20, // Large
  xl: 24, // Extra large
  xxl: 32, // 2X large
  xxxl: 40, // 3X large
  huge: 48, // Huge
  massive: 64, // Massive
} as const;

/**
 * Semantic Spacing
 *
 * These provide meaningful names for specific use cases
 */
export const SemanticSpacing = {
  // Component internal spacing
  componentPaddingSmall: Spacing.sm, // 8px
  componentPadding: Spacing.base, // 16px
  componentPaddingLarge: Spacing.xl, // 24px

  // Element spacing within components
  elementGapSmall: Spacing.xs, // 4px
  elementGap: Spacing.sm, // 8px
  elementGapLarge: Spacing.md, // 12px

  // Section spacing (between major UI sections)
  sectionGapSmall: Spacing.base, // 16px
  sectionGap: Spacing.xl, // 24px
  sectionGapLarge: Spacing.xxxl, // 40px

  // Screen/Page spacing
  screenPaddingHorizontal: Spacing.base, // 16px
  screenPaddingVertical: Spacing.lg, // 20px
  screenGap: Spacing.base, // 16px

  // Card spacing
  cardPadding: Spacing.base, // 16px
  cardPaddingSmall: Spacing.md, // 12px
  cardGap: Spacing.md, // 12px

  // Chat specific
  messageBubblePadding: Spacing.md, // 12px
  messageBubbleGap: Spacing.sm, // 8px
  messageGroupGap: Spacing.base, // 16px
  inputBarPadding: Spacing.base, // 16px

  // Button spacing
  buttonPaddingHorizontal: Spacing.xl, // 24px
  buttonPaddingVertical: Spacing.md, // 12px
  buttonGap: Spacing.sm, // 8px

  // List spacing
  listItemPadding: Spacing.base, // 16px
  listItemGap: Spacing.xs, // 4px
  listSectionGap: Spacing.xl, // 24px
} as const;

/**
 * Border Radius Values
 * For consistent corner rounding
 */
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8, // Default border radius
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999, // Fully rounded (pill shape)
} as const;

/**
 * Chat specific border radius
 */
export const ChatBorderRadius = {
  messageBubble: BorderRadius.lg, // 16px - Message bubbles
  messageGroupStart: BorderRadius.lg, // 16px - First message in group
  messageGroupMiddle: BorderRadius.sm, // 4px - Middle messages
  messageGroupEnd: BorderRadius.lg, // 16px - Last message in group
  inputBar: BorderRadius.xxl, // 24px - Input bar (pill-like)
  card: BorderRadius.md, // 12px - Cards
  avatar: BorderRadius.full, // Circular avatars
} as const;

/**
 * Spacing utility functions
 *
 * Helper functions for creating spacing-related style objects.
 */
export const SpacingUtils = {
  /**
   * Multiply spacing value by a factor
   *
   * @param spacing - The base spacing value
   * @param factor - The multiplication factor
   * @returns The multiplied spacing value
   *
   * @example
   * ```typescript
   * const doubled = SpacingUtils.multiply(Spacing.base, 2);
   * console.log(doubled); // 32 (16 * 2)
   * ```
   */
  multiply(spacing: number, factor: number): number {
    return spacing * factor;
  },

  /**
   * Add multiple spacing values
   *
   * @param spacings - Variable number of spacing values to add
   * @returns The sum of all spacing values
   *
   * @example
   * ```typescript
   * const total = SpacingUtils.add(Spacing.sm, Spacing.md, Spacing.lg);
   * console.log(total); // 40 (8 + 12 + 20)
   * ```
   */
  add(...spacings: number[]): number {
    return spacings.reduce((sum, spacing) => sum + spacing, 0);
  },

  /**
   * Create symmetric padding object
   *
   * @param value - The padding value to apply on all sides
   * @returns A padding style object
   *
   * @example
   * ```typescript
   * const style = new Style({
   *   ...SpacingUtils.padding(Spacing.base)
   * });
   * ```
   */
  padding(value: number): { padding: number } {
    return { padding: value };
  },

  /**
   * Create horizontal padding object
   *
   * @param value - The padding value for left and right
   * @returns A horizontal padding style object
   *
   * @example
   * ```typescript
   * const style = new Style({
   *   ...SpacingUtils.paddingHorizontal(Spacing.lg)
   * });
   * ```
   */
  paddingHorizontal(value: number): { paddingHorizontal: number } {
    return { paddingHorizontal: value };
  },

  /**
   * Create vertical padding object
   *
   * @param value - The padding value for top and bottom
   * @returns A vertical padding style object
   *
   * @example
   * ```typescript
   * const style = new Style({
   *   ...SpacingUtils.paddingVertical(Spacing.md)
   * });
   * ```
   */
  paddingVertical(value: number): { paddingVertical: number } {
    return { paddingVertical: value };
  },

  /**
   * Create custom padding object
   *
   * Allows specifying different padding values for each side.
   *
   * @param top - Top padding value
   * @param right - Right padding value
   * @param bottom - Bottom padding value
   * @param left - Left padding value
   * @returns A custom padding style object
   *
   * @example
   * ```typescript
   * const style = new Style({
   *   ...SpacingUtils.paddingCustom(
   *     Spacing.lg,    // top: 20
   *     Spacing.base,  // right: 16
   *     Spacing.md,    // bottom: 12
   *     Spacing.base   // left: 16
   *   )
   * });
   * ```
   */
  paddingCustom(
    top: number,
    right: number,
    bottom: number,
    left: number,
  ): {
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
  } {
    return {
      paddingTop: top,
      paddingRight: right,
      paddingBottom: bottom,
      paddingLeft: left,
    };
  },

  /**
   * Create symmetric margin object
   *
   * @param value - The margin value to apply on all sides
   * @returns A margin style object
   *
   * @example
   * ```typescript
   * const style = new Style({
   *   ...SpacingUtils.margin(Spacing.base)
   * });
   * ```
   */
  margin(value: number): { margin: number } {
    return { margin: value };
  },

  /**
   * Create gap object for flexbox
   *
   * Sets the gap between flex items in a flexbox container.
   *
   * @param value - The gap value
   * @returns A gap style object
   *
   * @example
   * ```typescript
   * const containerStyle = new Style({
   *   flexDirection: 'row',
   *   ...SpacingUtils.gap(Spacing.sm)
   * });
   * ```
   */
  gap(value: number): { gap: number } {
    return { gap: value };
  },
};

/**
 * Type exports
 */
export type SpacingKey = keyof typeof Spacing;
export type SemanticSpacingKey = keyof typeof SemanticSpacing;
export type BorderRadiusKey = keyof typeof BorderRadius;

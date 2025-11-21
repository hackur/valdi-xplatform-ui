/**
 * Color Palette for Valdi AI UI
 *
 * Provides a consistent color system across the application.
 * Includes primary, secondary, semantic colors, and grayscale.
 */

export const Colors = {
  // Primary Colors
  primary: '#3B82F6',          // Blue - Main brand color
  primaryDark: '#2563EB',      // Darker blue for active states
  primaryLight: '#60A5FA',     // Lighter blue for hover states
  primaryLighter: '#DBEAFE',   // Very light blue for backgrounds

  // Secondary Colors
  secondary: '#8B5CF6',        // Purple - Accent color
  secondaryDark: '#7C3AED',    // Darker purple
  secondaryLight: '#A78BFA',   // Lighter purple
  secondaryLighter: '#EDE9FE', // Very light purple

  // Semantic Colors
  success: '#10B981',          // Green - Success states
  successDark: '#059669',      // Darker green
  successLight: '#D1FAE5',     // Light green background

  warning: '#F59E0B',          // Amber - Warning states
  warningDark: '#D97706',      // Darker amber
  warningLight: '#FEF3C7',     // Light amber background

  error: '#EF4444',            // Red - Error states
  errorDark: '#DC2626',        // Darker red
  errorLight: '#FEE2E2',       // Light red background

  info: '#3B82F6',             // Blue - Info states
  infoDark: '#2563EB',         // Darker blue
  infoLight: '#DBEAFE',        // Light blue background

  // Grayscale
  gray50: '#F9FAFB',           // Lightest gray
  gray100: '#F3F4F6',          // Very light gray
  gray200: '#E5E7EB',          // Light gray
  gray300: '#D1D5DB',          // Medium-light gray
  gray400: '#9CA3AF',          // Medium gray
  gray500: '#6B7280',          // Base gray
  gray600: '#4B5563',          // Medium-dark gray
  gray700: '#374151',          // Dark gray
  gray800: '#1F2937',          // Very dark gray
  gray900: '#111827',          // Darkest gray

  // Surface Colors
  background: '#F9FAFB',       // App background
  surface: '#FFFFFF',          // Card/surface background
  surfaceHover: '#F3F4F6',     // Hover state for surfaces
  surfaceActive: '#E5E7EB',    // Active/pressed state

  // Text Colors
  textPrimary: '#111827',      // Primary text
  textSecondary: '#6B7280',    // Secondary text
  textTertiary: '#9CA3AF',     // Tertiary/disabled text
  textInverse: '#FFFFFF',      // Text on dark backgrounds

  // Border Colors
  border: '#E5E7EB',           // Default border
  borderLight: '#F3F4F6',      // Light border
  borderDark: '#D1D5DB',       // Dark border

  // Special Colors
  overlay: 'rgba(0, 0, 0, 0.5)',        // Modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.25)',  // Light overlay
  shadowColor: 'rgba(0, 0, 0, 0.1)',    // Shadow color

  // AI Message Specific
  userMessageBg: '#3B82F6',             // User message background
  userMessageText: '#FFFFFF',           // User message text
  aiMessageBg: '#F3F4F6',              // AI message background
  aiMessageText: '#111827',             // AI message text

  // Streaming/Loading States
  streamingBg: '#DBEAFE',              // Background during streaming
  loadingPrimary: '#3B82F6',           // Loading indicator primary
  loadingSecondary: '#60A5FA',         // Loading indicator secondary

  // Code Block Colors
  codeBackground: '#1F2937',           // Code block background
  codeText: '#F9FAFB',                 // Code block text
  codeBorder: '#374151',               // Code block border

  // Transparent
  transparent: 'transparent',
} as const;

/**
 * Color utility functions
 */
export const ColorUtils = {
  /**
   * Convert hex color to RGBA with opacity
   */
  hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * Get appropriate text color (light/dark) for a background
   */
  getContrastText(backgroundColor: string): string {
    // Simple luminance calculation
    // For production, consider using a proper color contrast library
    return backgroundColor === Colors.primary ||
           backgroundColor === Colors.primaryDark ||
           backgroundColor === Colors.userMessageBg ||
           backgroundColor === Colors.codeBackground
      ? Colors.textInverse
      : Colors.textPrimary;
  },
};

// Type for color keys
export type ColorKey = keyof typeof Colors;

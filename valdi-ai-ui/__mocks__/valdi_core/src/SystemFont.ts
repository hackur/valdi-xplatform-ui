/**
 * Mock SystemFont for testing
 * Valdi system font utilities
 */

export interface SystemFontConfig {
  size?: number;
  weight?: 'regular' | 'medium' | 'bold';
  style?: 'normal' | 'italic';
}

export class SystemFont {
  static get(_config?: SystemFontConfig): string {
    return 'system-font';
  }

  static bold(size: number): string {
    return `system-font-bold-${size}`;
  }

  static regular(size: number): string {
    return `system-font-regular-${size}`;
  }

  static medium(size: number): string {
    return `system-font-medium-${size}`;
  }
}

// Export helper functions that are commonly used
export function systemFont(size: number): string {
  return `system-font-${size}`;
}

export function systemBoldFont(size: number): string {
  return `system-font-bold-${size}`;
}

export function systemRegularFont(size: number): string {
  return `system-font-regular-${size}`;
}

export function systemMediumFont(size: number): string {
  return `system-font-medium-${size}`;
}

export default SystemFont;

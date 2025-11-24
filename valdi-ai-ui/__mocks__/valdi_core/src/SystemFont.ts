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
  static get(config?: SystemFontConfig): string {
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

export default SystemFont;

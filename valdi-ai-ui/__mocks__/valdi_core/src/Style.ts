/**
 * Mock Style for testing
 */

export class Style<T = any> {
  style: Record<string, any>;

  constructor(style: Record<string, any>) {
    this.style = style;
  }
}

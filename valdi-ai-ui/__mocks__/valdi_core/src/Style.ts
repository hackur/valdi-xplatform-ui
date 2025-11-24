/**
 * Mock Style for testing
 * Valdi Style API for component styling
 */

export type StyleValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | StyleObject;

export interface StyleObject {
  [key: string]: StyleValue;
}

export class Style {
  private styles: StyleObject = {};

  constructor(styles?: StyleObject) {
    if (styles) {
      this.styles = styles;
    }
  }

  static create(styles: StyleObject): Style {
    return new Style(styles);
  }

  merge(other: Style): Style {
    return new Style({ ...this.styles, ...(other as any).styles });
  }

  toObject(): StyleObject {
    return this.styles;
  }
}

export default Style;

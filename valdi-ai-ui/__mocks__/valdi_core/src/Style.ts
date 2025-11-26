/**
 * Mock Style for testing
 * Valdi Style API for component styling
 *
 * IMPORTANT: Style<T> is generic to match the real Valdi API.
 * The type parameter T (View, Label, etc.) specifies which element
 * type the style applies to. This ensures type safety with the
 * Valdi compiler while maintaining compatibility with npm type-check.
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

/**
 * Style class for Valdi components.
 * @template T - The element type this style applies to (View, Label, Image, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Style<T = unknown> {
  private styles: StyleObject = {};

  constructor(styles?: StyleObject) {
    if (styles) {
      this.styles = styles;
    }
  }

  static create<T>(styles: StyleObject): Style<T> {
    return new Style<T>(styles);
  }

  merge<U>(other: Style<U>): Style<T> {
    return new Style<T>({ ...this.styles, ...(other as Style<unknown>).styles });
  }

  toObject(): StyleObject {
    return this.styles;
  }
}

export default Style;

/**
 * Utility Types
 *
 * Common TypeScript utility types for the Valdi AI UI application.
 * These types help with type transformations and improve type safety.
 */

/**
 * Deep Partial - Makes all properties and nested properties optional
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   address: {
 *     street: string;
 *     city: string;
 *   };
 * }
 *
 * const partialUser: DeepPartial<User> = {
 *   address: { city: 'NYC' } // street is optional
 * };
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep Readonly - Makes all properties and nested properties readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Awaited - Unwraps the type of a Promise
 * Note: This is built into TypeScript 4.5+, but we include it for compatibility
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * ValueOf - Gets the type of values in an object or array
 * @example
 * ```typescript
 * const STATUS = { SUCCESS: 'success', ERROR: 'error' } as const;
 * type Status = ValueOf<typeof STATUS>; // 'success' | 'error'
 * ```
 */
export type ValueOf<T> = T[keyof T];

/**
 * Mutable - Removes readonly from all properties
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * RequireAtLeastOne - Requires at least one of the specified keys to be present
 * @example
 * ```typescript
 * interface Config {
 *   api?: string;
 *   token?: string;
 *   credentials?: Credentials;
 * }
 *
 * type ValidConfig = RequireAtLeastOne<Config, 'api' | 'token' | 'credentials'>;
 * ```
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * RequireExactlyOne - Requires exactly one of the specified keys to be present
 */
export type RequireExactlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

/**
 * Nullable - Makes a type nullable (null or undefined)
 */
export type Nullable<T> = T | null | undefined;

/**
 * NonNullableFields - Makes all fields of an object non-nullable
 */
export type NonNullableFields<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * PartialBy - Makes specific keys optional
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * type UserUpdate = PartialBy<User, 'name' | 'email'>; // id required, name/email optional
 * ```
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * RequiredBy - Makes specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Promisify - Converts function return types to Promises
 */
export type Promisify<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T;

/**
 * UnPromisify - Unwraps Promise return types from functions
 */
export type UnPromisify<T> = T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => R
  : T;

/**
 * JsonSerializable - Type for JSON-serializable values
 */
export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject { [key: string]: JsonValue }
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Constructor - Type for class constructors
 */
export type Constructor<T = object> = new (...args: any[]) => T;

/**
 * AbstractConstructor - Type for abstract class constructors
 */
export type AbstractConstructor<T = object> = abstract new (
  ...args: any[]
) => T;

/**
 * Expand - Expands object types for better intellisense
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * ExpandRecursively - Recursively expands object types
 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

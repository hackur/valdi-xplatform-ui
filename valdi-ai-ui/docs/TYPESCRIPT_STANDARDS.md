# TypeScript Standards and Best Practices

This document outlines TypeScript standards, best practices, and common error patterns found in the Valdi AI UI codebase. It serves as a reference for maintaining code quality and avoiding common pitfalls.

## Table of Contents

1. [Override Modifier Requirements](#override-modifier-requirements)
2. [Type Annotations for Recursive Types](#type-annotations-for-recursive-types)
3. [Type Assertions](#type-assertions)
4. [Import Patterns](#import-patterns)
5. [Common TypeScript Errors](#common-typescript-errors)
6. [Valdi-Specific TypeScript](#valdi-specific-typescript)
7. [Best Practices](#best-practices)

---

## Override Modifier Requirements

### When to Use `override`

The `override` modifier must be used when:
- Extending a class and overriding inherited methods
- Overriding base class properties
- Ensuring type safety across inheritance hierarchies

### Error: TS4114 - Missing Override Modifier

**Error Message**: `This member must have an 'override' modifier because it overrides a member in the base class`

### Example from Codebase

File: `/modules/common/src/errors/ErrorTypes.ts`

```typescript
// CORRECT - Using override modifier
export class AppError extends Error {
  public override readonly cause?: Error;

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options?.cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  override toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
```

### Child Class Pattern

```typescript
export class APIError extends AppError {
  public readonly statusCode?: number;
  public readonly provider?: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.API_NETWORK_ERROR,
    options?: {
      statusCode?: number;
      provider?: string;
    },
  ) {
    super(message, code, ErrorSeverity.MEDIUM, {
      ...options,
      retryable: true,
    });

    this.statusCode = options?.statusCode;
    this.provider = options?.provider;
  }

  // CORRECT - Using override for inherited method
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      provider: this.provider,
    };
  }
}
```

### Type Guard Functions with Error Classes

```typescript
/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Usage in error handling
 */
function handleError(error: unknown) {
  if (isAPIError(error)) {
    // error is now typed as APIError
    console.log(error.statusCode);
    console.log(error.provider);
  } else if (isAppError(error)) {
    // error is now typed as AppError
    console.log(error.code);
    console.log(error.severity);
  }
}
```

### Configuration

Enable strict mode in `tsconfig.json` to enforce `override`:

```json
{
  "compilerOptions": {
    "noImplicitOverride": true,
    "strict": true
  }
}
```

---

## Type Annotations for Recursive Types

### Problem: TS7022 - Implicit Any in Recursive Types

**Error Message**: `Implicitly has an 'any' type because it does not have a type annotation`

### Solution: z.lazy() Pattern with Zod

When defining recursive or circular type schemas, use `z.lazy()` to defer evaluation:

File: `/modules/common/src/schemas/ToolSchemas.ts`

```typescript
import { z } from 'zod';

/**
 * Tool Parameter Type Schema
 */
export const ToolParameterTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'object',
  'array',
]);

/**
 * Tool Parameter Schema with recursive support
 *
 * CORRECT: Using explicit type annotation with z.ZodType<T>
 * and z.lazy() for recursive references
 */
export const ToolParameterSchema: z.ZodType<{
  name: string;
  type: z.infer<typeof ToolParameterTypeSchema>;
  description: string;
  required: boolean;
  default?: unknown;
  enum?: unknown[];
  items?: any;
  properties?: Record<string, any>;
}> = z.object({
  name: z.string().min(1, 'Parameter name is required'),
  type: ToolParameterTypeSchema,
  description: z.string().min(1, 'Parameter description is required'),
  required: z.boolean(),
  default: z.unknown().optional(),
  enum: z.array(z.unknown()).optional(),

  // CORRECT: Using z.lazy() for self-referential type
  items: z.lazy(() => ToolParameterSchema).optional(),

  // CORRECT: Using z.lazy() with z.record() for nested properties
  properties: z.record(z.lazy(() => ToolParameterSchema)).optional(),
});

/**
 * Inferred type from schema
 * This is safe and type-safe
 */
export type ToolParameter = z.infer<typeof ToolParameterSchema>;
```

### Without Explicit Type Annotation (INCORRECT)

```typescript
// INCORRECT - Will cause TS7022 error for implicit any
export const ToolParameterSchema = z.object({
  name: z.string(),
  type: ToolParameterTypeSchema,
  description: z.string(),
  items: z.lazy(() => ToolParameterSchema).optional(),
  properties: z.record(z.lazy(() => ToolParameterSchema)).optional(),
});
```

### Circular Type References

```typescript
// For circular type references without Zod, use interfaces:

/**
 * Comment type with potential replies
 */
export interface Comment {
  id: string;
  text: string;
  author: string;
  replies?: Comment[]; // Circular reference
}

/**
 * Tree node with generic children
 */
export interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[]; // Recursive reference
}
```

### Best Practices for Recursive Types

1. **Always use explicit type annotations** when defining recursive schemas
2. **Use `z.lazy()`** for Zod schema recursion to defer evaluation
3. **Use interfaces** for circular TypeScript types (they're compatible with Zod)
4. **Test inference** with `type Tests = Expect<Equal<infer Type, ExpectedType>>`

---

## Type Assertions

### When to Use Type Assertions

Type assertions should be used sparingly. Use them when:
- You have more knowledge about the type than TypeScript can infer
- Third-party libraries return loosely-typed values
- Converting from one type to a compatible type is intentional

### Safe Type Assertions

File: `/modules/model_config/src/CustomProviderStore.ts`

```typescript
/**
 * CORRECT: Safe assertion after type check
 */
async testProviderConfig(
  config: CustomProviderConfig,
): Promise<ProviderTestResult> {
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return {
      success: true,
      responseTime,
      modelInfo: {
        id: config.modelId,
        name: config.modelName || config.modelId,
        // Safe assertion: we know API returns data array
        capabilities: data.data ? data.data.map((m: any) => m.id) : [],
      },
    };
  } catch (error) {
    // CORRECT: Check before asserting
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### Unsafe Type Assertions to Avoid

```typescript
// INCORRECT - Unsafe assertion without validation
const value = something as MyType; // May cause runtime errors

// CORRECT - Validate before asserting
const value = something as MyType;
if (value.requiredProperty === undefined) {
  throw new Error('Invalid value');
}

// BETTER - Use type guards
function isMyType(value: unknown): value is MyType {
  return (
    typeof value === 'object' &&
    value !== null &&
    'requiredProperty' in value
  );
}

if (isMyType(value)) {
  // value is safely typed as MyType
}
```

### Assertion Patterns from Codebase

File: `/modules/settings/src/components/TextInput.tsx`

```typescript
/**
 * CORRECT: Using type assertion for Event types from Valdi
 */
private readonly handleChange = (event: EditTextEvent): void => {
  const { onChangeText } = this.viewModel;
  if (onChangeText) {
    // event.text is safely typed through EditTextEvent
    onChangeText(event.text);
  }
};
```

### Suppressing Unused Variable Warnings

```typescript
/**
 * CORRECT: Using @ts-ignore for intentionally unused code
 */
class TextInput extends StatefulComponent<TextInputProps, TextInputState> {
  /**
   * Reserved for future secure text display functionality
   * (suppress unused warning)
   */
  // @ts-ignore Intentionally kept for future use
  private readonly getDisplayValue = (): string => {
    const { value, secureTextEntry } = this.viewModel;

    if (secureTextEntry && value) {
      return '•'.repeat(value.length);
    }

    return value;
  };
}
```

---

## Import Patterns

### Type-Only Imports

Use `import type` for importing types to avoid runtime dependencies:

File: `/modules/model_config/src/CustomProviderStore.ts`

```typescript
/**
 * CORRECT: Type-only imports for types and interfaces
 */
import type { StorageProvider } from 'common/src/services/StorageProvider';
import type {
  CustomProviderConfig,
  ProviderTestResult,
  ValidationResult,
  ExportedProviders,
} from './types';

/**
 * CORRECT: Regular imports for runtime values
 */
import { STORAGE_KEY, EXPORT_VERSION } from './constants';
```

### Benefits of Type-Only Imports

1. **Cleaner compiled output** - Types are removed during compilation
2. **Avoid circular dependencies** - Types don't create module cycles
3. **Better tree-shaking** - Bundlers can remove unused imports
4. **Performance** - Smaller bundle sizes

### Dynamic Require() Pattern

When you need to load modules conditionally:

```typescript
// CORRECT: Dynamic import for optional dependencies
async function loadOptionalPlugin(pluginName: string) {
  try {
    // At runtime, uses dynamic require/import
    const module = await import(`./plugins/${pluginName}`);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load plugin: ${pluginName}`);
    return null;
  }
}
```

### Avoiding Circular Dependencies

```typescript
// INCORRECT: Creates circular dependency
// file-a.ts
import { TypeFromB } from './file-b';

// file-b.ts
import { TypeFromA } from './file-a';

// CORRECT: Use type-only imports
// file-a.ts
import type { TypeFromB } from './file-b';

// file-b.ts
import type { TypeFromA } from './file-a';
```

---

## Common TypeScript Errors

### TS4114: Missing Override Modifier

**Occurs when**: Extending a class and overriding inherited members without using `override` keyword

**Solution**:
```typescript
// INCORRECT
class Child extends Parent {
  myMethod() { }
}

// CORRECT
class Child extends Parent {
  override myMethod() { }
}
```

**Enable automatic detection**:
```json
{
  "compilerOptions": {
    "noImplicitOverride": true
  }
}
```

### TS7022: Implicit Any in Recursive Types

**Occurs when**: Defining recursive types without explicit type annotations

**Solution**:
```typescript
// INCORRECT
export const MySchema = z.object({
  name: z.string(),
  children: z.array(z.lazy(() => MySchema)).optional(),
});

// CORRECT
export const MySchema: z.ZodType<{
  name: string;
  children?: any[];
}> = z.object({
  name: z.string(),
  children: z.array(z.lazy(() => MySchema)).optional(),
});
```

### TS2322: Type Not Assignable

**Occurs when**: Assigning a value to a variable with incompatible type

**Solution**:
```typescript
// INCORRECT
const value: string = 123; // Error: Type 'number' is not assignable to type 'string'

// CORRECT - Option 1: Fix the source
const value: string = '123';

// CORRECT - Option 2: Use union type
const value: string | number = 123;

// CORRECT - Option 3: Type assertion (use cautiously)
const value: string = 123 as any as string;
```

### TS6133: Unused Variable

**Occurs when**: Declaring variables or parameters that are not used

**Solutions**:
```typescript
// Option 1: Remove if genuinely unused
function myFunction(usedParam: string) {
  return usedParam.toUpperCase();
}

// Option 2: Prefix with underscore if intentionally unused
function myFunction(_unusedParam: string, usedParam: string) {
  return usedParam.toUpperCase();
}

// Option 3: Suppress with comment (use sparingly)
// @ts-ignore
const unusedValue = expensiveOperation();

// Option 4: For destructuring, use renaming
const { used, _unused } = myObject;
```

### TS2339: Property Does Not Exist

**Occurs when**: Accessing properties that don't exist on a type

**Solution**:
```typescript
// INCORRECT
interface User {
  name: string;
}
const user: User = { name: 'John' };
console.log(user.age); // Error: Property 'age' does not exist

// CORRECT - Option 1: Add to interface
interface User {
  name: string;
  age?: number;
}

// CORRECT - Option 2: Use type guard
if ('age' in user) {
  console.log(user.age);
}

// CORRECT - Option 3: Use generic index signature
interface User {
  name: string;
  [key: string]: any;
}
```

---

## Valdi-Specific TypeScript

### Style Type Parameters

The Valdi framework requires explicit type parameters for styles:

File: `/modules/common/src/components/Button.tsx`

```typescript
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';

/**
 * CORRECT: Always specify Style<T> type parameter
 */
interface ButtonProps {
  title: string;
  style?: Style<View> | Record<string, unknown>;
}

class Button extends Component<ButtonProps> {
  private getContainerStyle(): Style<View> {
    return new Style<View>({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    });
  }

  private getLabelStyle(): Style<Label> {
    return new Style<Label>({
      fontSize: 16,
      color: '#000',
    });
  }
}

// At the bottom, define reusable styles
const styles = {
  container: new Style<View>({
    width: '100%',
    padding: 16,
  }),

  label: new Style<Label>({
    fontSize: 14,
    fontWeight: 'bold',
  }),
};
```

### Component Props Interfaces

```typescript
/**
 * CORRECT: Explicit props interface for Valdi components
 */
export interface TextInputProps {
  /** Current value */
  value: string;

  /** Placeholder text */
  placeholder?: string;

  /** Secure text entry (for passwords/API keys) */
  secureTextEntry?: boolean;

  /** Change handler */
  onChangeText?: (text: string) => void;

  /** Custom style */
  style?: Style<View> | Record<string, unknown>;
}

/**
 * CORRECT: Use as generic parameter
 */
export class TextInput extends StatefulComponent<TextInputProps, TextInputState> {
  override state: TextInputState = {
    isFocused: false,
  };
}
```

### Event Handler Types

File: `/modules/settings/src/components/TextInput.tsx`

```typescript
import type { EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';

/**
 * CORRECT: Type event handlers with Valdi event types
 */
private readonly handleChange = (event: EditTextEvent): void => {
  const { onChangeText } = this.viewModel;
  if (onChangeText) {
    // event.text is safely typed
    onChangeText(event.text);
  }
};
```

### Style Conventions

```typescript
/**
 * CORRECT: Valdi style conventions
 */
const styles = {
  container: new Style<View>({
    // Use systemFont instead of fontSize
    font: systemFont(16),

    // Use individual padding properties
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,

    // Use flexGrow/flexShrink instead of flex
    flexGrow: 1,

    // Use flexDirection, alignItems, justifyContent
    flexDirection: 'column',
    alignItems: 'center',
  }),
};

/**
 * INCORRECT: Standard CSS properties in web
 */
const BAD_styles = {
  container: new Style<View>({
    fontSize: 16, // Wrong - use systemFont
    padding: 8, // Wrong - use paddingTop, paddingBottom, etc.
    flex: 1, // Wrong - use flexGrow
  }),
};
```

### Component Element Names

```typescript
/**
 * CORRECT: Use lowercase Valdi elements
 */
export class MyComponent extends Component<Props> {
  override onRender() {
    return (
      <view>
        <label>Hello</label>
        <scroll>
          <textfield />
        </scroll>
      </view>
    );
  }
}

/**
 * INCORRECT: Don't use React-style capitalized names
 */
// <View>     // Wrong
// <Text>     // Wrong
// <ScrollView> // Wrong
// <TextField> // Wrong
```

---

## Best Practices

### 1. Strict Mode Compliance

Always use TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

### 2. Avoid `any` Type

```typescript
// INCORRECT
function process(data: any): any {
  return data.someMethod();
}

// CORRECT - Use generics
function process<T>(data: T): T {
  if (typeof data === 'object' && data !== null && 'someMethod' in data) {
    return (data as any).someMethod();
  }
  return data;
}

// CORRECT - Use union types
function process(data: string | number | object): string | number | object {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  return data;
}
```

### 3. Proper Generic Usage

```typescript
/**
 * CORRECT: Using generics for type safety
 */
export interface Store<T> {
  get(): T;
  set(value: T): void;
  subscribe(callback: (value: T) => void): () => void;
}

export class LocalStorage<T> implements Store<T> {
  constructor(private key: string) {}

  get(): T {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : null;
  }

  set(value: T): void {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  subscribe(callback: (value: T) => void): () => void {
    // implementation
    return () => {};
  }
}
```

### 4. Type Guards and Predicates

```typescript
/**
 * CORRECT: Implement type guard predicates
 */
function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.includes('@');
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Usage
function handleResponse(response: unknown) {
  if (isRecord(response) && 'data' in response) {
    console.log(response.data);
  }
}
```

### 5. Exhaustive Switch Statements

```typescript
/**
 * CORRECT: Use never type for exhaustive checks
 */
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Loading...';
    case 'success':
      return 'Done!';
    case 'error':
      return 'Failed';
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// If you add a new status type, this will now error at 'default'
```

### 6. Discriminated Unions

```typescript
/**
 * CORRECT: Using discriminated unions for type narrowing
 */
type StreamEvent =
  | { type: 'start'; messageId: string }
  | { type: 'chunk'; messageId: string; content: string; delta: string }
  | { type: 'complete'; messageId: string; message: Message }
  | { type: 'error'; messageId: string; error: string };

function handleStreamEvent(event: StreamEvent) {
  switch (event.type) {
    case 'start':
      console.log(`Starting: ${event.messageId}`);
      break;
    case 'chunk':
      // event.content and event.delta are available here
      console.log(`Delta: ${event.delta}`);
      break;
    case 'complete':
      // event.message is available here
      console.log(`Message: ${event.message}`);
      break;
    case 'error':
      // event.error is available here
      console.error(`Error: ${event.error}`);
      break;
  }
}
```

### 7. Const Assertions

```typescript
/**
 * CORRECT: Use as const for literal types
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

type Severity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

/**
 * Better alternative: Use enums
 */
export enum ErrorSeverityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
```

### 8. Optional Chaining and Nullish Coalescing

```typescript
/**
 * CORRECT: Use modern operators
 */
function getErrorMessage(error: unknown): string {
  // Optional chaining
  const message = (error as any)?.message?.toString?.();

  // Nullish coalescing (use ?? instead of ||)
  return message ?? 'An error occurred';
}

// Accessing nested properties safely
const userId = user?.profile?.settings?.notifications?.userId;
const count = data?.items?.length ?? 0;
```

---

## Configuration Files

### tsconfig.json Recommendations

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",

    // Strict mode settings
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,

    // Module resolution
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // Emit options
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,

    // Skip lib check for faster compilation
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    // Paths for module resolution
    "baseUrl": ".",
    "paths": {
      "common/*": ["modules/common/*"],
      "chat_core/*": ["modules/chat_core/*"],
      "chat_ui/*": ["modules/chat_ui/*"]
    }
  },
  "include": ["modules/**/*.ts", "modules/**/*.tsx"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-implicit-any-catch': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
    }],
    '@typescript-eslint/explicit-function-return-types': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
  },
};
```

---

## Summary

This TypeScript standards document provides guidance for:

1. **Type Safety**: Using strict mode and avoiding implicit `any`
2. **Class Hierarchies**: Using `override` modifier for inherited members
3. **Recursive Types**: Using `z.lazy()` with explicit type annotations
4. **Assertions**: Being cautious with type assertions and always validating
5. **Imports**: Using type-only imports and avoiding circular dependencies
6. **Error Handling**: Implementing proper error hierarchies with custom error classes
7. **Valdi Framework**: Following framework-specific conventions for styles and components
8. **Best Practices**: Using type guards, discriminated unions, and other modern patterns

For questions or additions to this document, refer to the Context.md file or create issues with TypeScript improvements.

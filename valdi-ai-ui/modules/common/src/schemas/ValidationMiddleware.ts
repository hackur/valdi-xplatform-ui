/**
 * Validation Middleware
 *
 * Utility functions and middleware for applying Zod validation
 * across the application at key boundaries.
 */

import { z } from 'zod';

/**
 * Validation Error
 * Custom error class for validation failures
 */
export class ValidationError extends Error {
  public readonly errors: z.ZodIssue[];
  public readonly formattedErrors: Record<string, string[]>;

  constructor(zodError: z.ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = zodError.errors;
    this.formattedErrors = this.formatErrors(zodError);
  }

  private formatErrors(zodError: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const error of zodError.errors) {
      const path = error.path.join('.');
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(error.message);
    }

    return formatted;
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    const firstError = this.errors[0];
    if (!firstError) return 'Validation failed';

    const path = firstError.path.length > 0 ? `${firstError.path.join('.')}: ` : '';
    return `${path}${firstError.message}`;
  }

  /**
   * Get all error messages as a formatted string
   */
  getAllMessages(): string {
    return this.errors.map((error) => {
      const path = error.path.length > 0 ? `${error.path.join('.')}: ` : '';
      return `${path}${error.message}`;
    }).join('\n');
  }
}

/**
 * Validation Result
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

/**
 * Validate data with a Zod schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Safely validate data with a Zod schema
 * Returns a result object instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: new ValidationError(error) };
    }
    throw error;
  }
}

/**
 * Validate and transform data
 */
export function validateAndTransform<T, R>(
  schema: z.ZodSchema<T>,
  data: unknown,
  transform: (data: T) => R,
): R {
  const validated = validate(schema, data);
  return transform(validated);
}

/**
 * Create a validation middleware function
 */
export function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>,
  onError?: (error: ValidationError) => void,
) {
  return (data: unknown): T => {
    try {
      return validate(schema, data);
    } catch (error) {
      if (error instanceof ValidationError) {
        onError?.(error);
      }
      throw error;
    }
  };
}

/**
 * Validate form data
 * Useful for validating multiple fields at once
 */
export function validateForm<T extends Record<string, unknown>>(
  schemas: { [K in keyof T]: z.ZodSchema<T[K]> },
  data: Record<string, unknown>,
): ValidationResult<T> {
  const errors: Record<string, string[]> = {};
  const validated: Partial<T> = {};

  for (const [key, schema] of Object.entries(schemas)) {
    const result = safeValidate(schema, data[key]);
    if (result.success) {
      validated[key as keyof T] = result.data;
    } else {
      errors[key] = result.error.errors.map((e) => e.message);
    }
  }

  if (Object.keys(errors).length > 0) {
    // Create a Zod error with all field errors
    const zodError = new z.ZodError(
      Object.entries(errors).flatMap(([path, messages]) =>
        messages.map((message) => ({
          code: 'custom' as const,
          path: [path],
          message,
        })),
      ),
    );
    return { success: false, error: new ValidationError(zodError) };
  }

  return { success: true, data: validated as T };
}

/**
 * Validate API response
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  response: unknown,
): T {
  if (!response) {
    throw new Error('API response is empty');
  }

  try {
    return validate(schema, response);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('API response validation failed:', error.getAllMessages());
      throw new Error(`Invalid API response: ${error.getUserMessage()}`);
    }
    throw error;
  }
}

/**
 * Validate and coerce data types
 * Useful for parsing data from localStorage or query params
 */
export function validateWithCoercion<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T {
  // Create a coerced version of the schema that attempts to convert types
  const coercedSchema = z.preprocess((val) => {
    // Handle string 'true'/'false' -> boolean
    if (val === 'true') return true;
    if (val === 'false') return false;

    // Handle numeric strings -> numbers
    if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
      return Number(val);
    }

    // Handle JSON strings -> objects
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }

    return val;
  }, schema);

  return validate(coercedSchema, data);
}

/**
 * Create a validator function with default error handling
 */
export function createValidator<T>(
  schema: z.ZodSchema<T>,
  options: {
    onError?: (error: ValidationError) => void;
    defaultValue?: T;
  } = {},
) {
  return (data: unknown): T | undefined => {
    const result = safeValidate(schema, data);

    if (result.success) {
      return result.data;
    }

    options.onError?.(result.error);

    if (options.defaultValue !== undefined) {
      return options.defaultValue;
    }

    return undefined;
  };
}

/**
 * Batch validate multiple items
 */
export function validateBatch<T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
): { valid: T[]; invalid: Array<{ index: number; error: ValidationError }> } {
  const valid: T[] = [];
  const invalid: Array<{ index: number; error: ValidationError }> = [];

  items.forEach((item, index) => {
    const result = safeValidate(schema, item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ index, error: result.error });
    }
  });

  return { valid, invalid };
}

/**
 * Create a type-safe validator wrapper
 */
export function createTypeSafeValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown): T => validate(schema, data),
    safeValidate: (data: unknown): ValidationResult<T> => safeValidate(schema, data),
    validateBatch: (items: unknown[]) => validateBatch(schema, items),
    is: (data: unknown): data is T => {
      const result = safeValidate(schema, data);
      return result.success;
    },
  };
}

/**
 * Validation decorators for class methods
 * (useful for service layer validation)
 */
export function ValidateInput<T>(schema: z.ZodSchema<T>) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      // Validate the first argument
      if (args.length > 0) {
        args[0] = validate(schema, args[0]);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validation helper for store mutations
 */
export function validateStoreMutation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  mutationName: string,
): T {
  try {
    return validate(schema, data);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation failed for ${mutationName}:`, error.getAllMessages());
      throw new Error(`Invalid data for ${mutationName}: ${error.getUserMessage()}`);
    }
    throw error;
  }
}

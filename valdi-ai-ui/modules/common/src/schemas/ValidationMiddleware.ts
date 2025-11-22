/**
 * Validation Middleware
 *
 * Runtime validation middleware using Zod schemas.
 * Provides validation decorators and helper functions for type-safe data validation.
 */

import { z } from 'zod';

/**
 * Validation Result Type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
}

/**
 * Generic validation function
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    errors: result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  };
}

/**
 * Validation decorator for methods
 * Validates method arguments before execution
 */
export function ValidateArgs<T extends z.ZodTypeAny>(
  schema: T,
  argIndex: number = 0,
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const result = validate(schema, args[argIndex]);

      if (!result.success) {
        throw new Error(`Validation failed for ${String(propertyKey)}: ${result.error}`);
      }

      // Replace argument with validated data
      args[argIndex] = result.data;
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validation decorator for async methods
 * Validates method arguments before execution
 */
export function ValidateArgsAsync<T extends z.ZodTypeAny>(
  schema: T,
  argIndex: number = 0,
): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = validate(schema, args[argIndex]);

      if (!result.success) {
        throw new Error(`Validation failed for ${String(propertyKey)}: ${result.error}`);
      }

      // Replace argument with validated data
      args[argIndex] = result.data;
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validation decorator for return values
 * Validates method return value before returning
 */
export function ValidateReturn<T extends z.ZodTypeAny>(schema: T): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const returnValue = originalMethod.apply(this, args);

      const result = validate(schema, returnValue);

      if (!result.success) {
        throw new Error(`Return value validation failed for ${String(propertyKey)}: ${result.error}`);
      }

      return result.data;
    };

    return descriptor;
  };
}

/**
 * Validation decorator for async return values
 * Validates method return value before returning
 */
export function ValidateReturnAsync<T extends z.ZodTypeAny>(schema: T): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const returnValue = await originalMethod.apply(this, args);

      const result = validate(schema, returnValue);

      if (!result.success) {
        throw new Error(`Return value validation failed for ${String(propertyKey)}: ${result.error}`);
      }

      return result.data;
    };

    return descriptor;
  };
}

/**
 * Safe parse wrapper with better error formatting
 */
export function safeParse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): ValidationResult<z.infer<T>> {
  return validate(schema, data);
}

/**
 * Throws if validation fails
 */
export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = validate(schema, data);

  if (!result.success) {
    throw new Error(`Validation failed: ${result.error}`);
  }

  return result.data!;
}

/**
 * Batch validation for arrays
 */
export function validateArray<T extends z.ZodTypeAny>(
  schema: T,
  items: unknown[],
): ValidationResult<z.infer<T>[]> {
  const results: z.infer<T>[] = [];
  const errors: Array<{ index: number; path: string; message: string }> = [];

  items.forEach((item, index) => {
    const result = validate(schema, item);

    if (result.success) {
      results.push(result.data!);
    } else {
      result.errors?.forEach((error) => {
        errors.push({
          index,
          path: error.path,
          message: error.message,
        });
      });
    }
  });

  if (errors.length > 0) {
    return {
      success: false,
      error: errors
        .map((e) => `Item ${e.index} - ${e.path}: ${e.message}`)
        .join(', '),
      errors: errors.map((e) => ({
        path: `[${e.index}].${e.path}`,
        message: e.message,
      })),
    };
  }

  return {
    success: true,
    data: results,
  };
}

/**
 * Partial validation - validates only provided fields
 */
export function validatePartial<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): ValidationResult<Partial<z.infer<T>>> {
  if (!(schema instanceof z.ZodObject)) {
    throw new Error('validatePartial only works with ZodObject schemas');
  }

  const partialSchema = schema.partial();
  return validate(partialSchema, data);
}

/**
 * Deep partial validation
 */
export function validateDeepPartial<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): ValidationResult<z.infer<T>> {
  if (!(schema instanceof z.ZodObject)) {
    throw new Error('validateDeepPartial only works with ZodObject schemas');
  }

  const deepPartialSchema = schema.deepPartial();
  return validate(deepPartialSchema, data);
}

/**
 * Validation middleware factory for API endpoints
 */
export function createValidationMiddleware<T extends z.ZodTypeAny>(schema: T) {
  return (data: unknown): z.infer<T> => {
    const result = validate(schema, data);

    if (!result.success) {
      throw new Error(`Validation failed: ${result.error}`);
    }

    return result.data!;
  };
}

/**
 * Create async validation middleware
 */
export function createAsyncValidationMiddleware<T extends z.ZodTypeAny>(schema: T) {
  return async (data: unknown): Promise<z.infer<T>> => {
    const result = validate(schema, data);

    if (!result.success) {
      throw new Error(`Validation failed: ${result.error}`);
    }

    return result.data!;
  };
}

/**
 * Compose multiple validation schemas
 */
export function composeValidations<T extends z.ZodTypeAny[]>(...schemas: T) {
  return (data: unknown): ValidationResult<any> => {
    for (const schema of schemas) {
      const result = validate(schema, data);
      if (!result.success) {
        return result;
      }
      data = result.data;
    }

    return {
      success: true,
      data,
    };
  };
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Throw ValidationError if validation fails
 */
export function validateOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = validate(schema, data);

  if (!result.success) {
    throw new ValidationError(result.error!, result.errors || []);
  }

  return result.data!;
}

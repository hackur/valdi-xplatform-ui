/**
 * Tool Validation Schemas
 *
 * Comprehensive Zod schemas for validating tool definitions and execution.
 */

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
 * Tool Parameter Schema
 */
export const ToolParameterSchema = z.object({
  name: z.string().min(1, 'Parameter name is required'),
  type: ToolParameterTypeSchema,
  description: z.string().min(1, 'Parameter description is required'),
  required: z.boolean(),
  default: z.unknown().optional(),
  enum: z.array(z.unknown()).optional(),
  items: z.lazy(() => ToolParameterSchema).optional(), // For array items
  properties: z.record(z.lazy(() => ToolParameterSchema)).optional(), // For object properties
});

/**
 * Tool Definition Schema
 */
export const ToolDefinitionSchema = z.object({
  name: z
    .string()
    .min(1, 'Tool name is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tool name must contain only letters, numbers, and underscores'),
  description: z.string().min(1, 'Tool description is required'),
  parameters: z.array(ToolParameterSchema),
  execute: z.function().args(z.record(z.unknown())).returns(z.promise(z.unknown())),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  author: z.string().optional(),
});

/**
 * Tool Execution Input Schema
 */
export const ToolExecutionInputSchema = z.object({
  toolName: z.string().min(1, 'Tool name is required'),
  arguments: z.record(z.unknown()),
  timeout: z.number().int().positive('Timeout must be positive').optional(),
  retries: z.number().int().nonnegative('Retries cannot be negative').optional(),
});

/**
 * Tool Execution Result Schema
 */
export const ToolExecutionResultSchema = z.object({
  toolName: z.string().min(1, 'Tool name is required'),
  success: z.boolean(),
  result: z.unknown().optional(),
  error: z.string().optional(),
  executionTime: z.number().nonnegative('Execution time cannot be negative'),
  timestamp: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Tool Registry Entry Schema
 */
export const ToolRegistryEntrySchema = z.object({
  tool: ToolDefinitionSchema,
  enabled: z.boolean(),
  lastUsed: z.date().optional(),
  usageCount: z.number().int().nonnegative('Usage count cannot be negative'),
  averageExecutionTime: z
    .number()
    .nonnegative('Average execution time cannot be negative')
    .optional(),
});

/**
 * Tool Configuration Schema
 */
export const ToolConfigurationSchema = z.object({
  enabledTools: z.array(z.string()),
  maxConcurrentExecutions: z.number().int().positive('Max concurrent executions must be positive'),
  defaultTimeout: z.number().int().positive('Default timeout must be positive'),
  retryPolicy: z.object({
    maxRetries: z.number().int().nonnegative('Max retries cannot be negative'),
    retryDelay: z.number().int().nonnegative('Retry delay cannot be negative'),
    backoffMultiplier: z.number().positive('Backoff multiplier must be positive'),
  }),
});

/**
 * Type exports inferred from schemas
 */
export type ToolParameterType = z.infer<typeof ToolParameterTypeSchema>;
export type ToolParameter = z.infer<typeof ToolParameterSchema>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
export type ToolExecutionInput = z.infer<typeof ToolExecutionInputSchema>;
export type ToolExecutionResult = z.infer<typeof ToolExecutionResultSchema>;
export type ToolRegistryEntry = z.infer<typeof ToolRegistryEntrySchema>;
export type ToolConfiguration = z.infer<typeof ToolConfigurationSchema>;

/**
 * Validation Helper Functions
 */

/**
 * Validate a tool definition
 */
export function validateToolDefinition(data: unknown): ToolDefinition {
  return ToolDefinitionSchema.parse(data);
}

/**
 * Safely validate a tool definition
 */
export function safeValidateToolDefinition(data: unknown): {
  success: boolean;
  data?: ToolDefinition;
  error?: z.ZodError;
} {
  const result = ToolDefinitionSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate tool execution input
 */
export function validateToolExecutionInput(data: unknown): ToolExecutionInput {
  return ToolExecutionInputSchema.parse(data);
}

/**
 * Validate tool execution result
 */
export function validateToolExecutionResult(data: unknown): ToolExecutionResult {
  return ToolExecutionResultSchema.parse(data);
}

/**
 * Validate tool configuration
 */
export function validateToolConfiguration(data: unknown): ToolConfiguration {
  return ToolConfigurationSchema.parse(data);
}

/**
 * Validate tool arguments against parameter definitions
 */
export function validateToolArguments(
  parameters: ToolParameter[],
  args: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required parameters
  for (const param of parameters) {
    if (param.required && !(param.name in args)) {
      errors.push(`Required parameter '${param.name}' is missing`);
    }
  }

  // Check parameter types
  for (const [key, value] of Object.entries(args)) {
    const param = parameters.find((p) => p.name === key);
    if (!param) {
      errors.push(`Unknown parameter '${key}'`);
      continue;
    }

    // Type checking
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (param.type !== actualType && value !== null && value !== undefined) {
      errors.push(
        `Parameter '${key}' has wrong type. Expected ${param.type}, got ${actualType}`,
      );
    }

    // Enum validation
    if (param.enum && !param.enum.includes(value)) {
      errors.push(`Parameter '${key}' must be one of: ${param.enum.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

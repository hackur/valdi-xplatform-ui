/**
 * Provider Config Zod Schemas
 *
 * Runtime validation schemas for AI provider configurations.
 * Supports built-in providers (OpenAI, Anthropic, Google) and custom OpenAI-compatible providers.
 */

import { z } from 'zod';

/**
 * Provider Type Schema
 */
export const ProviderTypeSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'custom-openai-compatible',
]);

/**
 * Model Capabilities Schema
 */
export const ModelCapabilitiesSchema = z.object({
  streaming: z.boolean(),
  functionCalling: z.boolean(),
  vision: z.boolean(),
  maxTokens: z.number().int().positive(),
  jsonMode: z.boolean(),
});

/**
 * Model Definition Schema
 */
export const ModelDefinitionSchema = z.object({
  id: z.string().min(1, 'Model ID is required'),
  name: z.string().min(1, 'Model name is required'),
  provider: ProviderTypeSchema,
  capabilities: ModelCapabilitiesSchema,
  defaultTemperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  costPerInputToken: z.number().nonnegative().optional(),
  costPerOutputToken: z.number().nonnegative().optional(),
  isAvailable: z.boolean(),
  customProviderId: z.string().optional(),
});

/**
 * Built-in Provider Config Schema
 */
export const BuiltInProviderConfigSchema = z.object({
  type: z.enum(['openai', 'anthropic', 'google']),
  name: z.string().min(1, 'Provider name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  models: z.array(ModelDefinitionSchema),
  isEnabled: z.boolean(),
});

/**
 * Custom Provider Config Schema
 */
export const CustomProviderConfigSchema = z.object({
  id: z.string().min(1, 'Provider ID is required'),
  type: z.literal('custom-openai-compatible'),
  name: z.string().min(1, 'Provider name is required'),
  baseUrl: z.string().url('Invalid base URL'),
  apiKey: z.string().optional(),
  modelId: z.string().min(1, 'Model ID is required'),
  modelName: z.string().optional(),
  defaultTemperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  maxContextTokens: z.number().int().positive().optional(),
  supportsStreaming: z.boolean().optional(),
  supportsFunctionCalling: z.boolean().optional(),
  headers: z.record(z.string()).optional(),
  isEnabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Provider Config Union Schema
 */
export const ProviderConfigSchema = z.discriminatedUnion('type', [
  BuiltInProviderConfigSchema,
  CustomProviderConfigSchema,
]);

/**
 * Model Selection Schema
 */
export const ModelSelectionSchema = z.object({
  providerType: ProviderTypeSchema,
  modelId: z.string().min(1, 'Model ID is required'),
  customProviderId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

/**
 * Provider Test Result Schema
 */
export const ProviderTestResultSchema = z.object({
  success: z.boolean(),
  responseTime: z.number().nonnegative().optional(),
  error: z.string().optional(),
  modelInfo: z
    .object({
      id: z.string(),
      name: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Model Registry Stats Schema
 */
export const ModelRegistryStatsSchema = z.object({
  totalProviders: z.number().int().nonnegative(),
  enabledProviders: z.number().int().nonnegative(),
  customProviders: z.number().int().nonnegative(),
  totalModels: z.number().int().nonnegative(),
  availableModels: z.number().int().nonnegative(),
});

/**
 * Validation Error Schema
 */
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

/**
 * Validation Warning Schema
 */
export const ValidationWarningSchema = z.object({
  field: z.string(),
  message: z.string(),
});

/**
 * Custom Provider Validation Result Schema
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(ValidationWarningSchema),
});

/**
 * Exported Providers Schema
 */
export const ExportedProvidersSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  exportedAt: z.coerce.date(),
  customProviders: z.array(CustomProviderConfigSchema),
});

/**
 * Validation Helper Functions
 */
export const ProviderConfigValidation = {
  /**
   * Validate built-in provider config
   */
  validateBuiltInProviderConfig(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof BuiltInProviderConfigSchema>; error?: string } {
    const result = BuiltInProviderConfigSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate custom provider config
   */
  validateCustomProviderConfig(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof CustomProviderConfigSchema>; error?: string } {
    const result = CustomProviderConfigSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate any provider config
   */
  validateProviderConfig(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ProviderConfigSchema>; error?: string } {
    const result = ProviderConfigSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate model selection
   */
  validateModelSelection(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ModelSelectionSchema>; error?: string } {
    const result = ModelSelectionSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate exported providers
   */
  validateExportedProviders(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ExportedProvidersSchema>; error?: string } {
    const result = ExportedProvidersSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },
};

/**
 * Type exports using Zod inference
 */
export type ProviderTypeType = z.infer<typeof ProviderTypeSchema>;
export type ModelCapabilitiesType = z.infer<typeof ModelCapabilitiesSchema>;
export type ModelDefinitionType = z.infer<typeof ModelDefinitionSchema>;
export type BuiltInProviderConfigType = z.infer<typeof BuiltInProviderConfigSchema>;
export type CustomProviderConfigType = z.infer<typeof CustomProviderConfigSchema>;
export type ProviderConfigType = z.infer<typeof ProviderConfigSchema>;
export type ModelSelectionType = z.infer<typeof ModelSelectionSchema>;
export type ProviderTestResultType = z.infer<typeof ProviderTestResultSchema>;
export type ModelRegistryStatsType = z.infer<typeof ModelRegistryStatsSchema>;
export type ValidationResultType = z.infer<typeof ValidationResultSchema>;
export type ExportedProvidersType = z.infer<typeof ExportedProvidersSchema>;

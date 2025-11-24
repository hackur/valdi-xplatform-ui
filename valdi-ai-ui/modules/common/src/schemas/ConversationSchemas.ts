/**
 * Conversation Validation Schemas
 *
 * Comprehensive Zod schemas for validating conversation-related data structures.
 */

import { z } from 'zod';

/**
 * AI Provider Schema
 */
export const AIProviderSchema = z.enum(['openai', 'anthropic', 'google', 'xai', 'custom'], {
  errorMap: () => ({
    message: 'Invalid AI provider. Must be openai, anthropic, google, xai, or custom',
  }),
});

/**
 * Model Configuration Schema
 */
export const ModelConfigSchema = z.object({
  provider: AIProviderSchema,
  modelId: z.string().min(1, 'Model ID is required'),
  displayName: z.string().optional(),
  temperature: z
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(2, 'Temperature must be at most 2')
    .optional(),
  maxTokens: z.number().int().positive('Max tokens must be positive').optional(),
  topP: z
    .number()
    .min(0, 'Top P must be at least 0')
    .max(1, 'Top P must be at most 1')
    .optional(),
  frequencyPenalty: z
    .number()
    .min(-2, 'Frequency penalty must be at least -2')
    .max(2, 'Frequency penalty must be at most 2')
    .optional(),
  presencePenalty: z
    .number()
    .min(-2, 'Presence penalty must be at least -2')
    .max(2, 'Presence penalty must be at most 2')
    .optional(),
  toolsEnabled: z.boolean().optional(),
  apiEndpoint: z.string().url('Invalid API endpoint URL').optional(),
});

/**
 * Conversation Status Schema
 */
export const ConversationStatusSchema = z.enum(['active', 'archived', 'deleted'], {
  errorMap: () => ({
    message: 'Invalid conversation status. Must be active, archived, or deleted',
  }),
});

/**
 * Workflow Type Schema
 */
export const WorkflowTypeSchema = z.enum([
  'sequential',
  'routing',
  'parallel',
  'evaluator',
  'orchestrator',
]);

/**
 * Conversation Metadata Schema
 */
export const ConversationMetadataSchema = z
  .object({
    workflowType: WorkflowTypeSchema.optional(),
    agents: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough(); // Allow additional custom metadata

/**
 * Full Conversation Schema
 */
export const ConversationSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
  title: z
    .string()
    .min(1, 'Conversation title is required')
    .max(200, 'Conversation title must be less than 200 characters'),
  systemPrompt: z.string().optional(),
  modelConfig: ModelConfigSchema,
  createdAt: z.date({
    required_error: 'Conversation creation date is required',
    invalid_type_error: 'Creation date must be a Date object',
  }),
  updatedAt: z.date({
    required_error: 'Conversation update date is required',
    invalid_type_error: 'Update date must be a Date object',
  }),
  lastMessageAt: z.date().optional(),
  status: ConversationStatusSchema,
  isPinned: z.boolean(),
  tags: z.array(z.string()),
  messageCount: z.number().int().nonnegative('Message count cannot be negative'),
  tokenCount: z.number().int().nonnegative('Token count cannot be negative').optional(),
  toolsEnabled: z.boolean().optional(),
  metadata: ConversationMetadataSchema.optional(),
});

/**
 * Conversation Create Input Schema
 */
export const CreateConversationInputSchema = z.object({
  title: z
    .string()
    .max(200, 'Conversation title must be less than 200 characters')
    .optional(),
  systemPrompt: z.string().max(10000, 'System prompt is too long').optional(),
  modelConfig: ModelConfigSchema,
  tags: z.array(z.string()).optional(),
  metadata: ConversationMetadataSchema.optional(),
});

/**
 * Conversation Update Input Schema
 */
export const UpdateConversationInputSchema = z.object({
  title: z
    .string()
    .min(1, 'Conversation title cannot be empty')
    .max(200, 'Conversation title must be less than 200 characters')
    .optional(),
  systemPrompt: z.string().max(10000, 'System prompt is too long').optional(),
  modelConfig: ModelConfigSchema.partial().optional(),
  status: ConversationStatusSchema.optional(),
  isPinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: ConversationMetadataSchema.partial().optional(),
});

/**
 * Conversation Filter Options Schema
 */
export const ConversationFilterOptionsSchema = z.object({
  status: z.array(ConversationStatusSchema).optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  provider: z.array(AIProviderSchema).optional(),
  searchQuery: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

/**
 * Conversation Sort Options Schema
 */
export const ConversationSortFieldSchema = z.enum([
  'createdAt',
  'updatedAt',
  'lastMessageAt',
  'title',
  'messageCount',
]);

export const ConversationSortOrderSchema = z.enum(['asc', 'desc']);

export const ConversationSortOptionsSchema = z.object({
  field: ConversationSortFieldSchema,
  order: ConversationSortOrderSchema,
});

/**
 * Conversation List Options Schema
 */
export const ConversationListOptionsSchema = z.object({
  filter: ConversationFilterOptionsSchema.optional(),
  sort: ConversationSortOptionsSchema.optional(),
  limit: z.number().int().positive('Limit must be positive').optional(),
  offset: z.number().int().nonnegative('Offset cannot be negative').optional(),
});

/**
 * Type exports inferred from schemas
 */
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
export type WorkflowType = z.infer<typeof WorkflowTypeSchema>;
export type ConversationMetadata = z.infer<typeof ConversationMetadataSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationInputSchema>;
export type UpdateConversationInput = z.infer<typeof UpdateConversationInputSchema>;
export type ConversationFilterOptions = z.infer<typeof ConversationFilterOptionsSchema>;
export type ConversationSortField = z.infer<typeof ConversationSortFieldSchema>;
export type ConversationSortOrder = z.infer<typeof ConversationSortOrderSchema>;
export type ConversationSortOptions = z.infer<typeof ConversationSortOptionsSchema>;
export type ConversationListOptions = z.infer<typeof ConversationListOptionsSchema>;

/**
 * Validation Helper Functions
 */

/**
 * Validate a conversation object
 */
export function validateConversation(data: unknown): Conversation {
  return ConversationSchema.parse(data);
}

/**
 * Safely validate a conversation with error handling
 */
export function safeValidateConversation(data: unknown): {
  success: boolean;
  data?: Conversation;
  error?: z.ZodError;
} {
  const result = ConversationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate conversation creation input
 */
export function validateCreateConversationInput(data: unknown): CreateConversationInput {
  return CreateConversationInputSchema.parse(data);
}

/**
 * Validate conversation update input
 */
export function validateUpdateConversationInput(data: unknown): UpdateConversationInput {
  return UpdateConversationInputSchema.parse(data);
}

/**
 * Validate model configuration
 */
export function validateModelConfig(data: unknown): ModelConfig {
  return ModelConfigSchema.parse(data);
}

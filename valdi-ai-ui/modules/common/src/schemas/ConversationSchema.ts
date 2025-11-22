/**
 * Conversation Zod Schemas
 *
 * Runtime validation schemas for Conversation types using Zod.
 * Provides type-safe validation for conversations, model configs, and related data.
 */

import { z } from 'zod';
import { MessageSchema } from './MessageSchema';

/**
 * AI Provider Schema
 */
export const AIProviderSchema = z.enum(['openai', 'anthropic', 'google', 'xai', 'custom']);

/**
 * Model Config Schema
 */
export const ModelConfigSchema = z.object({
  provider: AIProviderSchema,
  modelId: z.string().min(1, 'Model ID is required'),
  displayName: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  toolsEnabled: z.boolean().optional(),
  apiEndpoint: z.string().url('Invalid API endpoint URL').optional(),
});

/**
 * Conversation Status Schema
 */
export const ConversationStatusSchema = z.enum(['active', 'archived', 'deleted']);

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
  })
  .passthrough(); // Allow additional custom metadata

/**
 * Core Conversation Schema
 */
export const ConversationSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
  title: z.string().min(1, 'Title is required'),
  systemPrompt: z.string().optional(),
  modelConfig: ModelConfigSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastMessageAt: z.coerce.date().optional(),
  status: ConversationStatusSchema,
  isPinned: z.boolean(),
  tags: z.array(z.string()),
  messageCount: z.number().int().nonnegative(),
  tokenCount: z.number().int().nonnegative().optional(),
  metadata: ConversationMetadataSchema.optional(),
});

/**
 * Conversation With Messages Schema
 */
export const ConversationWithMessagesSchema = ConversationSchema.extend({
  messages: z.array(MessageSchema),
});

/**
 * Conversation Create Input Schema
 */
export const ConversationCreateInputSchema = z.object({
  title: z.string().optional(),
  systemPrompt: z.string().optional(),
  modelConfig: ModelConfigSchema,
  tags: z.array(z.string()).optional(),
  metadata: ConversationMetadataSchema.optional(),
});

/**
 * Conversation Update Input Schema
 */
export const ConversationUpdateInputSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  systemPrompt: z.string().optional(),
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
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

/**
 * Conversation Sort Field Schema
 */
export const ConversationSortFieldSchema = z.enum([
  'createdAt',
  'updatedAt',
  'lastMessageAt',
  'title',
  'messageCount',
]);

/**
 * Conversation Sort Order Schema
 */
export const ConversationSortOrderSchema = z.enum(['asc', 'desc']);

/**
 * Conversation Sort Options Schema
 */
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
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Conversation Export Format Schema
 */
export const ConversationExportFormatSchema = z.enum(['json', 'markdown', 'text', 'csv']);

/**
 * Validation Helper Functions
 */
export const ConversationValidation = {
  /**
   * Validate a conversation object
   */
  validateConversation(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ConversationSchema>; error?: string } {
    const result = ConversationSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate model config
   */
  validateModelConfig(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ModelConfigSchema>; error?: string } {
    const result = ModelConfigSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate conversation create input
   */
  validateConversationCreateInput(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ConversationCreateInputSchema>; error?: string } {
    const result = ConversationCreateInputSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate conversation update input
   */
  validateConversationUpdateInput(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof ConversationUpdateInputSchema>; error?: string } {
    const result = ConversationUpdateInputSchema.safeParse(data);
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
export type AIProviderType = z.infer<typeof AIProviderSchema>;
export type ModelConfigType = z.infer<typeof ModelConfigSchema>;
export type ConversationStatusType = z.infer<typeof ConversationStatusSchema>;
export type ConversationType = z.infer<typeof ConversationSchema>;
export type ConversationWithMessagesType = z.infer<typeof ConversationWithMessagesSchema>;
export type ConversationCreateInputType = z.infer<typeof ConversationCreateInputSchema>;
export type ConversationUpdateInputType = z.infer<typeof ConversationUpdateInputSchema>;
export type ConversationFilterOptionsType = z.infer<typeof ConversationFilterOptionsSchema>;
export type ConversationSortOptionsType = z.infer<typeof ConversationSortOptionsSchema>;
export type ConversationListOptionsType = z.infer<typeof ConversationListOptionsSchema>;

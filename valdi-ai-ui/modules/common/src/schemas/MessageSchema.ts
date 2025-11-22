/**
 * Message Zod Schemas
 *
 * Runtime validation schemas for Message types using Zod.
 * These schemas provide type-safe validation and can be used to validate
 * data at runtime, ensuring data integrity across the application.
 */

import { z } from 'zod';

/**
 * Message Role Schema
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool']);

/**
 * Message Status Schema
 */
export const MessageStatusSchema = z.enum([
  'pending',
  'sending',
  'streaming',
  'completed',
  'error',
  'cancelled',
]);

/**
 * Tool Call Status Schema
 */
export const ToolCallStatusSchema = z.enum(['pending', 'executing', 'completed', 'error']);

/**
 * Tool Call Schema
 */
export const ToolCallSchema = z.object({
  id: z.string().min(1, 'Tool call ID is required'),
  name: z.string().min(1, 'Tool name is required'),
  arguments: z.record(z.unknown()),
  result: z.unknown().optional(),
  error: z.string().optional(),
  status: ToolCallStatusSchema,
});

/**
 * Message Content Part Schemas
 */
export const TextContentPartSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

export const ImageContentPartSchema = z.object({
  type: z.literal('image'),
  imageUrl: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
});

export const ToolCallContentPartSchema = z.object({
  type: z.literal('tool-call'),
  toolCall: ToolCallSchema,
});

export const ToolResultContentPartSchema = z.object({
  type: z.literal('tool-result'),
  toolCallId: z.string().min(1, 'Tool call ID is required'),
  result: z.unknown(),
});

/**
 * Message Content Part Union Schema
 */
export const MessageContentPartSchema = z.discriminatedUnion('type', [
  TextContentPartSchema,
  ImageContentPartSchema,
  ToolCallContentPartSchema,
  ToolResultContentPartSchema,
]);

/**
 * Message Metadata Token Schema
 */
export const MessageMetadataTokensSchema = z.object({
  prompt: z.number().int().nonnegative().optional(),
  completion: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
});

/**
 * Message Metadata Finish Reason Schema
 */
export const MessageMetadataFinishReasonSchema = z.enum([
  'stop',
  'length',
  'tool-calls',
  'content-filter',
  'error',
]);

/**
 * Message Metadata Schema
 */
export const MessageMetadataSchema = z
  .object({
    model: z.string().optional(),
    tokens: MessageMetadataTokensSchema.optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
    finishReason: MessageMetadataFinishReasonSchema.optional(),
  })
  .passthrough(); // Allow additional custom metadata fields

/**
 * Core Message Schema
 */
export const MessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  conversationId: z.string().min(1, 'Conversation ID is required'),
  role: MessageRoleSchema,
  content: z.union([z.string(), z.array(MessageContentPartSchema)]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  status: MessageStatusSchema,
  toolCalls: z.array(ToolCallSchema).optional(),
  error: z.string().optional(),
  metadata: MessageMetadataSchema.optional(),
});

/**
 * Message Create Input Schema
 */
export const MessageCreateInputSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  role: MessageRoleSchema,
  content: z.union([z.string().min(1, 'Content cannot be empty'), z.array(MessageContentPartSchema)]),
  metadata: MessageMetadataSchema.optional(),
});

/**
 * Message Update Input Schema
 */
export const MessageUpdateInputSchema = z.object({
  content: z.union([z.string(), z.array(MessageContentPartSchema)]).optional(),
  status: MessageStatusSchema.optional(),
  toolCalls: z.array(ToolCallSchema).optional(),
  error: z.string().optional(),
  metadata: MessageMetadataSchema.partial().optional(),
});

/**
 * Stream Chunk Schema
 */
export const StreamChunkSchema = z.object({
  id: z.string().min(1, 'Stream chunk ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
  content: z.string(),
  delta: z.string(),
  timestamp: z.coerce.date(),
  isComplete: z.boolean(),
});

/**
 * Validation Helper Functions
 */
export const MessageValidation = {
  /**
   * Validate a message object
   */
  validateMessage(data: unknown): { success: boolean; data?: z.infer<typeof MessageSchema>; error?: string } {
    const result = MessageSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate message create input
   */
  validateMessageCreateInput(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof MessageCreateInputSchema>; error?: string } {
    const result = MessageCreateInputSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate message update input
   */
  validateMessageUpdateInput(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof MessageUpdateInputSchema>; error?: string } {
    const result = MessageUpdateInputSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate stream chunk
   */
  validateStreamChunk(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof StreamChunkSchema>; error?: string } {
    const result = StreamChunkSchema.safeParse(data);
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
export type MessageRoleType = z.infer<typeof MessageRoleSchema>;
export type MessageStatusType = z.infer<typeof MessageStatusSchema>;
export type ToolCallType = z.infer<typeof ToolCallSchema>;
export type MessageContentPartType = z.infer<typeof MessageContentPartSchema>;
export type MessageType = z.infer<typeof MessageSchema>;
export type MessageCreateInputType = z.infer<typeof MessageCreateInputSchema>;
export type MessageUpdateInputType = z.infer<typeof MessageUpdateInputSchema>;
export type StreamChunkType = z.infer<typeof StreamChunkSchema>;

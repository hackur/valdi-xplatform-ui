/**
 * Message Validation Schemas
 *
 * Comprehensive Zod schemas for validating message-related data structures.
 * Provides type-safe validation at API boundaries and user input points.
 */

import { z } from 'zod';

/**
 * Message Role Schema
 */
export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool'], {
  errorMap: () => ({ message: 'Invalid message role. Must be user, assistant, system, or tool' }),
});

/**
 * Message Status Schema
 */
export const MessageStatusSchema = z.enum(
  ['pending', 'sending', 'streaming', 'completed', 'error', 'cancelled'],
  {
    errorMap: () => ({
      message: 'Invalid message status. Must be pending, sending, streaming, completed, error, or cancelled',
    }),
  },
);

/**
 * Tool Call Status Schema
 */
export const ToolCallStatusSchema = z.enum(['pending', 'executing', 'completed', 'error'], {
  errorMap: () => ({
    message: 'Invalid tool call status. Must be pending, executing, completed, or error',
  }),
});

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
  text: z.string().min(1, 'Text content cannot be empty'),
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
 * Message Content Part - Discriminated Union
 */
export const MessageContentPartSchema = z.discriminatedUnion('type', [
  TextContentPartSchema,
  ImageContentPartSchema,
  ToolCallContentPartSchema,
  ToolResultContentPartSchema,
]);

/**
 * Message Content Schema
 * Can be either a simple string or an array of content parts
 */
export const MessageContentSchema = z.union([
  z.string().min(1, 'Message content cannot be empty'),
  z.array(MessageContentPartSchema).min(1, 'Message must have at least one content part'),
]);

/**
 * Message Metadata Schema
 */
export const MessageMetadataSchema = z
  .object({
    model: z.string().optional(),
    tokens: z
      .object({
        prompt: z.number().int().nonnegative().optional(),
        completion: z.number().int().nonnegative().optional(),
        total: z.number().int().nonnegative().optional(),
      })
      .optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
    finishReason: z.enum(['stop', 'length', 'tool-calls', 'content-filter', 'error']).optional(),
  })
  .passthrough(); // Allow additional custom metadata

/**
 * Full Message Schema
 */
export const MessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  conversationId: z.string().min(1, 'Conversation ID is required'),
  role: MessageRoleSchema,
  content: MessageContentSchema,
  createdAt: z.date({
    required_error: 'Message creation date is required',
    invalid_type_error: 'Creation date must be a Date object',
  }),
  updatedAt: z.date({
    required_error: 'Message update date is required',
    invalid_type_error: 'Update date must be a Date object',
  }),
  status: MessageStatusSchema,
  toolCalls: z.array(ToolCallSchema).optional(),
  error: z.string().optional(),
  metadata: MessageMetadataSchema.optional(),
});

/**
 * Message Create Input Schema
 * Omits auto-generated fields (id, timestamps)
 */
export const CreateMessageInputSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  role: MessageRoleSchema,
  content: MessageContentSchema,
  metadata: MessageMetadataSchema.optional(),
});

/**
 * Message Update Input Schema
 * All fields are optional for partial updates
 */
export const UpdateMessageInputSchema = z.object({
  content: MessageContentSchema.optional(),
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
  timestamp: z.date(),
  isComplete: z.boolean(),
});

/**
 * Type exports inferred from schemas
 */
export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type ToolCallStatus = z.infer<typeof ToolCallStatusSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type MessageContentPart = z.infer<typeof MessageContentPartSchema>;
export type MessageContent = z.infer<typeof MessageContentSchema>;
export type MessageMetadata = z.infer<typeof MessageMetadataSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type CreateMessageInput = z.infer<typeof CreateMessageInputSchema>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageInputSchema>;
export type StreamChunk = z.infer<typeof StreamChunkSchema>;

/**
 * Validation Helper Functions
 */

/**
 * Validate a message object
 */
export function validateMessage(data: unknown): Message {
  return MessageSchema.parse(data);
}

/**
 * Safely validate a message with error handling
 */
export function safeValidateMessage(data: unknown): {
  success: boolean;
  data?: Message;
  error?: z.ZodError;
} {
  const result = MessageSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate message creation input
 */
export function validateCreateMessageInput(data: unknown): CreateMessageInput {
  return CreateMessageInputSchema.parse(data);
}

/**
 * Validate message update input
 */
export function validateUpdateMessageInput(data: unknown): UpdateMessageInput {
  return UpdateMessageInputSchema.parse(data);
}

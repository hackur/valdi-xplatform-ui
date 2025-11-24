/**
 * User Input Validation Schemas
 *
 * Zod schemas for validating user input, settings, and configuration data.
 */

import { z } from 'zod';
import { AIProviderSchema, ModelConfigSchema } from './ConversationSchemas';

/**
 * Text Input Schema
 * For validating user text input in chat and forms
 */
export const TextInputSchema = z
  .string()
  .min(1, 'Input cannot be empty')
  .max(50000, 'Input is too long (max 50,000 characters)')
  .transform((str) => str.trim());

/**
 * Chat Message Input Schema
 * Specifically for user chat messages
 */
export const ChatMessageInputSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(10000, 'Message is too long (max 10,000 characters)')
  .transform((str) => str.trim());

/**
 * API Key Schema
 * Validates API key format for different providers
 */
export const ApiKeySchema = z
  .string()
  .min(20, 'API key is too short')
  .max(500, 'API key is too long')
  .refine(
    (key) => {
      // Basic validation - starts with expected prefix
      return (
        key.startsWith('sk-') || // OpenAI, Anthropic
        key.startsWith('AIza') || // Google
        key.startsWith('xai-')
      ); // xAI
    },
    {
      message: 'Invalid API key format',
    },
  );

/**
 * OpenAI API Key Schema
 */
export const OpenAIApiKeySchema = z
  .string()
  .min(20, 'OpenAI API key is too short')
  .startsWith('sk-', 'OpenAI API key must start with sk-');

/**
 * Anthropic API Key Schema
 */
export const AnthropicApiKeySchema = z
  .string()
  .min(20, 'Anthropic API key is too short')
  .startsWith('sk-ant-', 'Anthropic API key must start with sk-ant-');

/**
 * Google API Key Schema
 */
export const GoogleApiKeySchema = z
  .string()
  .min(20, 'Google API key is too short')
  .startsWith('AIza', 'Google API key must start with AIza');

/**
 * Settings Update Schema
 */
export const SettingsUpdateSchema = z.object({
  selectedProvider: AIProviderSchema.optional(),
  defaultModelConfig: ModelConfigSchema.optional(),
  darkMode: z.boolean().optional(),
  enableNotifications: z.boolean().optional(),
  enableSoundEffects: z.boolean().optional(),
  language: z.string().optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  autoSave: z.boolean().optional(),
});

/**
 * User Preferences Schema
 */
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.string().default('en'),
  notifications: z.object({
    enabled: z.boolean(),
    sound: z.boolean(),
    desktop: z.boolean(),
  }),
  chat: z.object({
    sendOnEnter: z.boolean(),
    showTimestamps: z.boolean(),
    markdownEnabled: z.boolean(),
    codeHighlighting: z.boolean(),
  }),
  privacy: z.object({
    saveHistory: z.boolean(),
    shareAnalytics: z.boolean(),
    allowTelemetry: z.boolean(),
  }),
});

/**
 * Search Query Schema
 */
export const SearchQuerySchema = z
  .string()
  .min(1, 'Search query cannot be empty')
  .max(500, 'Search query is too long');

/**
 * Tag Input Schema
 */
export const TagInputSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag is too long')
  .regex(/^[a-zA-Z0-9-_]+$/, 'Tag can only contain letters, numbers, hyphens, and underscores')
  .transform((str) => str.toLowerCase());

/**
 * URL Input Schema
 */
export const URLInputSchema = z.string().url('Invalid URL format');

/**
 * Email Input Schema
 */
export const EmailInputSchema = z.string().email('Invalid email format');

/**
 * Username Schema
 */
export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

/**
 * Password Schema
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine(
    (password) => {
      // At least one uppercase, one lowercase, one number
      return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
    },
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  );

/**
 * File Upload Schema
 */
export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().int().positive('File size must be positive').max(10485760, 'File is too large (max 10MB)'),
  type: z.string().min(1, 'File type is required'),
  content: z.instanceof(ArrayBuffer).or(z.string()),
});

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive('Page must be positive').default(1),
  pageSize: z
    .number()
    .int()
    .positive('Page size must be positive')
    .max(100, 'Page size is too large')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type exports inferred from schemas
 */
export type TextInput = z.infer<typeof TextInputSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type TagInput = z.infer<typeof TagInputSchema>;
export type URLInput = z.infer<typeof URLInputSchema>;
export type EmailInput = z.infer<typeof EmailInputSchema>;
export type Username = z.infer<typeof UsernameSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Validation Helper Functions
 */

/**
 * Validate text input
 */
export function validateTextInput(input: unknown): TextInput {
  return TextInputSchema.parse(input);
}

/**
 * Safely validate text input
 */
export function safeValidateTextInput(input: unknown): {
  success: boolean;
  data?: TextInput;
  error?: z.ZodError;
} {
  const result = TextInputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate chat message input
 */
export function validateChatMessageInput(input: unknown): ChatMessageInput {
  return ChatMessageInputSchema.parse(input);
}

/**
 * Validate API key for a specific provider
 */
export function validateApiKeyForProvider(provider: string, key: unknown): string {
  switch (provider) {
    case 'openai':
      return OpenAIApiKeySchema.parse(key);
    case 'anthropic':
      return AnthropicApiKeySchema.parse(key);
    case 'google':
      return GoogleApiKeySchema.parse(key);
    default:
      return ApiKeySchema.parse(key);
  }
}

/**
 * Validate settings update
 */
export function validateSettingsUpdate(data: unknown): SettingsUpdate {
  return SettingsUpdateSchema.parse(data);
}

/**
 * Validate user preferences
 */
export function validateUserPreferences(data: unknown): UserPreferences {
  return UserPreferencesSchema.parse(data);
}

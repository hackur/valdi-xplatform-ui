/**
 * Schemas - Main Export
 *
 * Central export for all Zod validation schemas and validation middleware.
 */

// Message schemas
export * from './MessageSchema';
export {
  MessageRoleSchema,
  MessageStatusSchema,
  ToolCallSchema,
  MessageSchema,
  MessageCreateInputSchema,
  MessageUpdateInputSchema,
  StreamChunkSchema,
  MessageValidation,
} from './MessageSchema';

export type {
  MessageRoleType,
  MessageStatusType,
  ToolCallType,
  MessageType,
  MessageCreateInputType,
  MessageUpdateInputType,
  StreamChunkType,
} from './MessageSchema';

// Conversation schemas
export * from './ConversationSchema';
export {
  AIProviderSchema,
  ModelConfigSchema,
  ConversationStatusSchema,
  ConversationSchema,
  ConversationWithMessagesSchema,
  ConversationCreateInputSchema,
  ConversationUpdateInputSchema,
  ConversationFilterOptionsSchema,
  ConversationSortOptionsSchema,
  ConversationListOptionsSchema,
  ConversationValidation,
} from './ConversationSchema';

export type {
  AIProviderType,
  ModelConfigType,
  ConversationStatusType,
  ConversationType,
  ConversationWithMessagesType,
  ConversationCreateInputType,
  ConversationUpdateInputType,
  ConversationFilterOptionsType,
  ConversationSortOptionsType,
  ConversationListOptionsType,
} from './ConversationSchema';

// Provider config schemas
export * from './ProviderConfigSchema';
export {
  ProviderTypeSchema,
  ModelCapabilitiesSchema,
  ModelDefinitionSchema,
  BuiltInProviderConfigSchema,
  CustomProviderConfigSchema,
  ProviderConfigSchema,
  ModelSelectionSchema,
  ProviderTestResultSchema,
  ModelRegistryStatsSchema,
  ValidationResultSchema,
  ExportedProvidersSchema,
  ProviderConfigValidation,
} from './ProviderConfigSchema';

export type {
  ProviderTypeType,
  ModelCapabilitiesType,
  ModelDefinitionType,
  BuiltInProviderConfigType,
  CustomProviderConfigType,
  ProviderConfigType,
  ModelSelectionType,
  ProviderTestResultType,
  ModelRegistryStatsType,
  ValidationResultType,
  ExportedProvidersType,
} from './ProviderConfigSchema';

// Agent & Workflow schemas
export * from './AgentSchema';
export {
  AgentDefinitionSchema,
  AgentContextSchema,
  AgentExecutionResultSchema,
  WorkflowTypeSchema,
  WorkflowConfigSchema,
  WorkflowStatusSchema,
  WorkflowExecutionStateSchema,
  LoopControlConfigSchema,
  LoopExecutionStateSchema,
  AgentValidation,
} from './AgentSchema';

export type {
  AgentDefinitionType,
  AgentContextType,
  AgentExecutionResultType,
  WorkflowTypeType,
  WorkflowConfigType,
  WorkflowStatusType,
  WorkflowExecutionStateType,
  LoopControlConfigType,
  LoopExecutionStateType,
} from './AgentSchema';

// Validation middleware
export * from './ValidationMiddleware';
export {
  validate,
  safeParse,
  parseOrThrow,
  validateArray,
  validatePartial,
  validateDeepPartial,
  validateOrThrow,
  createValidationMiddleware,
  createAsyncValidationMiddleware,
  composeValidations,
  ValidateArgs,
  ValidateArgsAsync,
  ValidateReturn,
  ValidateReturnAsync,
  ValidationError,
} from './ValidationMiddleware';

export type { ValidationResult } from './ValidationMiddleware';

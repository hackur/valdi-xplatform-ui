/**
 * Branded Types
 *
 * Type-safe wrappers for string/number IDs to prevent mixing different ID types.
 * Uses TypeScript's branded type pattern for compile-time safety with zero runtime overhead.
 *
 * @example
 * ```typescript
 * const convId: ConversationId = 'conv_123' as ConversationId;
 * const agentId: AgentId = 'agent_456' as AgentId;
 *
 * // This will cause a compile error:
 * // const wrongId: ConversationId = agentId;
 * ```
 */

/**
 * Branded type helper
 */
declare const brand: unique symbol;
type Brand<T, TBrand> = T & { [brand]: TBrand };

/**
 * Conversation ID - Uniquely identifies a conversation
 */
export type ConversationId = Brand<string, 'ConversationId'>;

/**
 * Message ID - Uniquely identifies a message within a conversation
 */
export type MessageId = Brand<string, 'MessageId'>;

/**
 * Agent ID - Uniquely identifies an AI agent
 */
export type AgentId = Brand<string, 'AgentId'>;

/**
 * Workflow ID - Uniquely identifies a workflow execution
 */
export type WorkflowId = Brand<string, 'WorkflowId'>;

/**
 * Provider ID - Uniquely identifies a custom AI provider
 */
export type ProviderId = Brand<string, 'ProviderId'>;

/**
 * Model ID - Uniquely identifies an AI model
 */
export type ModelId = Brand<string, 'ModelId'>;

/**
 * Helper functions to create branded types
 */
export const ConversationId = {
  create: (id: string): ConversationId => id as ConversationId,
  unwrap: (id: ConversationId): string => id as string,
};

export const MessageId = {
  create: (id: string): MessageId => id as MessageId,
  unwrap: (id: MessageId): string => id as string,
};

export const AgentId = {
  create: (id: string): AgentId => id as AgentId,
  unwrap: (id: AgentId): string => id as string,
};

export const WorkflowId = {
  create: (id: string): WorkflowId => id as WorkflowId,
  unwrap: (id: WorkflowId): string => id as string,
};

export const ProviderId = {
  create: (id: string): ProviderId => id as ProviderId,
  unwrap: (id: ProviderId): string => id as string,
};

export const ModelId = {
  create: (id: string): ModelId => id as ModelId,
  unwrap: (id: ModelId): string => id as string,
};

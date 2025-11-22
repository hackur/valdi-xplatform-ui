/**
 * Agent & Workflow Zod Schemas
 *
 * Runtime validation schemas for agent definitions, workflows, and execution state.
 * Provides comprehensive validation for agentic AI patterns.
 */

import { z } from 'zod';
import { MessageSchema } from './MessageSchema';

/**
 * Agent Model Provider Schema
 */
export const AgentModelProviderSchema = z.enum(['openai', 'anthropic', 'google']);

/**
 * Agent Model Config Schema
 */
export const AgentModelConfigSchema = z.object({
  provider: AgentModelProviderSchema,
  modelId: z.string().min(1, 'Model ID is required'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

/**
 * Agent Definition Schema
 */
export const AgentDefinitionSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().min(1, 'Agent description is required'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  model: AgentModelConfigSchema.optional(),
  tools: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Agent Execution Context Schema
 */
export const AgentContextSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  messages: z.array(MessageSchema),
  sharedData: z.record(z.unknown()).optional(),
  maxSteps: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
});

/**
 * Agent Execution Result Metadata Schema
 */
export const AgentExecutionResultMetadataSchema = z.object({
  steps: z.number().int().nonnegative(),
  toolCalls: z.number().int().nonnegative().optional(),
  tokens: z
    .object({
      prompt: z.number().int().nonnegative(),
      completion: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    })
    .optional(),
  executionTime: z.number().nonnegative(),
  finishReason: z.enum(['completed', 'max_steps', 'timeout', 'error']).optional(),
});

/**
 * Agent Execution Result Schema
 */
export const AgentExecutionResultSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  messages: z.array(MessageSchema),
  output: z.unknown().optional(),
  metadata: AgentExecutionResultMetadataSchema.optional(),
  error: z.string().optional(),
});

/**
 * Workflow Type Schema
 */
export const WorkflowTypeSchema = z.enum([
  'sequential',
  'parallel',
  'routing',
  'evaluator-optimizer',
]);

/**
 * Workflow Config Schema
 */
export const WorkflowConfigSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  type: WorkflowTypeSchema,
  agents: z.array(z.string().min(1)).min(1, 'At least one agent is required'),
  maxSteps: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
  stopWhen: z.function().optional(),
  config: z.record(z.unknown()).optional(),
});

/**
 * Workflow Status Schema
 */
export const WorkflowStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'timeout',
  'stopped',
]);

/**
 * Workflow Execution State Schema
 */
export const WorkflowExecutionStateSchema = z.object({
  id: z.string().min(1, 'Workflow execution ID is required'),
  config: WorkflowConfigSchema,
  status: WorkflowStatusSchema,
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  currentStep: z.number().int().nonnegative(),
  results: z.array(AgentExecutionResultSchema),
  error: z.string().optional(),
});

/**
 * Loop Controller Config Schema
 */
export const LoopControlConfigSchema = z.object({
  maxIterations: z.number().int().positive(),
  minIterations: z.number().int().nonnegative().optional(),
  iterationTimeout: z.number().int().positive().optional(),
  totalTimeout: z.number().int().positive().optional(),
  stopWhen: z.function().optional(),
  onIteration: z.function().optional(),
  onComplete: z.function().optional(),
  onError: z.function().optional(),
});

/**
 * Loop Execution State Schema
 */
export const LoopExecutionStateSchema = z.object({
  iteration: z.number().int().nonnegative(),
  startTime: z.coerce.date(),
  isRunning: z.boolean(),
  isStopped: z.boolean(),
  iterationResults: z.array(AgentExecutionResultSchema),
  totalTime: z.number().nonnegative(),
});

/**
 * Validation Helper Functions
 */
export const AgentValidation = {
  /**
   * Validate agent definition
   */
  validateAgentDefinition(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof AgentDefinitionSchema>; error?: string } {
    const result = AgentDefinitionSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate agent execution context
   */
  validateAgentContext(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof AgentContextSchema>; error?: string } {
    const result = AgentContextSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate agent execution result
   */
  validateAgentExecutionResult(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof AgentExecutionResultSchema>; error?: string } {
    const result = AgentExecutionResultSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate workflow config
   */
  validateWorkflowConfig(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof WorkflowConfigSchema>; error?: string } {
    const result = WorkflowConfigSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate workflow execution state
   */
  validateWorkflowExecutionState(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof WorkflowExecutionStateSchema>; error?: string } {
    const result = WorkflowExecutionStateSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  },

  /**
   * Validate loop control config
   */
  validateLoopControlConfig(
    data: unknown,
  ): { success: boolean; data?: z.infer<typeof LoopControlConfigSchema>; error?: string } {
    const result = LoopControlConfigSchema.safeParse(data);
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
export type AgentModelProviderType = z.infer<typeof AgentModelProviderSchema>;
export type AgentModelConfigType = z.infer<typeof AgentModelConfigSchema>;
export type AgentDefinitionType = z.infer<typeof AgentDefinitionSchema>;
export type AgentContextType = z.infer<typeof AgentContextSchema>;
export type AgentExecutionResultType = z.infer<typeof AgentExecutionResultSchema>;
export type WorkflowTypeType = z.infer<typeof WorkflowTypeSchema>;
export type WorkflowConfigType = z.infer<typeof WorkflowConfigSchema>;
export type WorkflowStatusType = z.infer<typeof WorkflowStatusSchema>;
export type WorkflowExecutionStateType = z.infer<typeof WorkflowExecutionStateSchema>;
export type LoopControlConfigType = z.infer<typeof LoopControlConfigSchema>;
export type LoopExecutionStateType = z.infer<typeof LoopExecutionStateSchema>;

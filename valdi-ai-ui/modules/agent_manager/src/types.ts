/**
 * Agent Manager Types
 *
 * Type definitions for agent management, workflow orchestration, and loop control.
 */

import { Message } from '@common';

/**
 * Agent Definition
 *
 * Defines an AI agent with its configuration and capabilities.
 */
export interface AgentDefinition {
  /** Unique agent identifier */
  id: string;

  /** Human-readable agent name */
  name: string;

  /** Agent description */
  description: string;

  /** System prompt for the agent */
  systemPrompt: string;

  /** Model configuration */
  model?: {
    provider: 'openai' | 'anthropic' | 'google';
    modelId: string;
    temperature?: number;
    maxTokens?: number;
  };

  /** Tools available to this agent */
  tools?: string[];

  /** Agent capabilities/tags */
  capabilities?: string[];

  /** Agent metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent Execution Context
 *
 * Context passed to agent during execution.
 */
export interface AgentContext {
  /** Conversation ID */
  conversationId: string;

  /** Input messages */
  messages: Message[];

  /** Shared context data between agents */
  sharedData?: Record<string, unknown>;

  /** Maximum steps for agent loop */
  maxSteps?: number;

  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Agent Execution Result
 *
 * Result of agent execution.
 */
export interface AgentExecutionResult {
  /** Agent ID that produced this result */
  agentId: string;

  /** Generated messages */
  messages: Message[];

  /** Output data */
  output?: unknown;

  /** Execution metadata */
  metadata?: {
    /** Steps taken */
    steps: number;

    /** Tool calls made */
    toolCalls?: number;

    /** Tokens used */
    tokens?: {
      prompt: number;
      completion: number;
      total: number;
    };

    /** Execution time in ms */
    executionTime: number;

    /** Finish reason */
    finishReason?: 'completed' | 'max_steps' | 'timeout' | 'error';
  };

  /** Error if execution failed */
  error?: string;
}

/**
 * Workflow Configuration
 *
 * Configuration for workflow execution.
 */
export interface WorkflowConfig {
  /** Workflow name */
  name: string;

  /** Workflow type */
  type: 'sequential' | 'parallel' | 'routing' | 'evaluator-optimizer';

  /** Agents in this workflow */
  agents: string[];

  /** Maximum total steps */
  maxSteps?: number;

  /** Timeout for entire workflow */
  timeout?: number;

  /** Stop condition function */
  stopWhen?: (results: AgentExecutionResult[]) => boolean;

  /** Workflow-specific configuration */
  config?: Record<string, unknown>;
}

/**
 * Workflow Execution Status
 */
export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'stopped';

/**
 * Workflow Execution State
 *
 * Tracks the state of workflow execution.
 */
export interface WorkflowExecutionState {
  /** Workflow ID */
  id: string;

  /** Workflow configuration */
  config: WorkflowConfig;

  /** Current status */
  status: WorkflowStatus;

  /** Start time */
  startTime: Date;

  /** End time */
  endTime?: Date;

  /** Current step */
  currentStep: number;

  /** Agent execution results */
  results: AgentExecutionResult[];

  /** Error if workflow failed */
  error?: string;
}

/**
 * Loop Controller Configuration
 */
export interface LoopControlConfig {
  /** Maximum iterations */
  maxIterations: number;

  /** Minimum iterations before allowing stop */
  minIterations?: number;

  /** Timeout per iteration (ms) */
  iterationTimeout?: number;

  /** Total timeout (ms) */
  totalTimeout?: number;

  /** Stop condition */
  stopWhen?: (iteration: number, results: AgentExecutionResult[]) => boolean;

  /** On iteration callback */
  onIteration?: (iteration: number, result: AgentExecutionResult) => void;

  /** On complete callback */
  onComplete?: (results: AgentExecutionResult[]) => void;

  /** On error callback */
  onError?: (error: Error) => void;
}

/**
 * Loop Execution State
 */
export interface LoopExecutionState {
  /** Current iteration */
  iteration: number;

  /** Start time */
  startTime: Date;

  /** Is running */
  isRunning: boolean;

  /** Is stopped */
  isStopped: boolean;

  /** Results from each iteration */
  iterationResults: AgentExecutionResult[];

  /** Total execution time */
  totalTime: number;
}

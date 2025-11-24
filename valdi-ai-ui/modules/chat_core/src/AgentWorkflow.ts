/**
 * AgentWorkflow
 *
 * Core infrastructure for multi-agent workflows using AI SDK v5.
 * Provides base classes and types for orchestrating multiple AI agents.
 */

import { Message, ModelConfig } from '@common/types';
import { ChatService } from './ChatService';
import { MessageStore } from './MessageStore';
import { StreamCallback } from './types';

/**
 * Workflow Type
 * Defines the execution pattern for multi-agent workflows
 */
export type WorkflowType =
  | 'sequential' // Execute agents one after another
  | 'parallel' // Execute agents simultaneously
  | 'routing' // Route to specialized agents based on input
  | 'evaluator-optimizer'; // Generate → Evaluate → Refine loop

/**
 * Agent Definition
 * Represents a specialized AI agent with specific role and configuration
 */
export interface AgentDefinition {
  /** Unique agent identifier */
  id: string;

  /** Agent name */
  name: string;

  /** Agent role/specialty */
  role: string;

  /** System prompt defining agent behavior */
  systemPrompt: string;

  /** Model configuration for this agent */
  modelConfig?: Partial<ModelConfig>;

  /** Maximum steps for this agent */
  maxSteps?: number;

  /** Agent-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow Step
 * Represents a single step in workflow execution
 */
export interface WorkflowStep {
  /** Step identifier */
  id: string;

  /** Agent that executed this step */
  agentId: string;

  /** Agent name */
  agentName: string;

  /** Input to the agent */
  input: string;

  /** Output from the agent */
  output: string;

  /** Step execution time (ms) */
  executionTime: number;

  /** Tokens used in this step */
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };

  /** Step metadata */
  metadata?: Record<string, unknown>;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Workflow State
 * Tracks the current state of workflow execution
 */
export interface WorkflowState {
  /** Workflow execution ID */
  executionId: string;

  /** Workflow type */
  type: WorkflowType;

  /** Current status */
  status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';

  /** Steps executed so far */
  steps: WorkflowStep[];

  /** Current step index */
  currentStepIndex: number;

  /** Total steps planned */
  totalSteps: number;

  /** Error if any */
  error?: string;

  /** Final result */
  result?: string;

  /** Start time */
  startedAt?: Date;

  /** End time */
  completedAt?: Date;

  /** Workflow metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow Configuration
 * Configuration for workflow execution
 */
export interface WorkflowConfig {
  /** Workflow type */
  type: WorkflowType;

  /** Agents involved in the workflow */
  agents: AgentDefinition[];

  /** Default model configuration */
  defaultModelConfig?: ModelConfig;

  /** Maximum total steps across all agents */
  maxTotalSteps?: number;

  /** Retry configuration */
  retry?: {
    maxRetries: number;
    retryDelay: number;
    retryableErrors?: string[];
  };

  /** Timeout in milliseconds */
  timeout?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Workflow Progress Event
 * Events emitted during workflow execution
 */
export type WorkflowProgressEvent =
  | { type: 'workflow-start'; executionId: string }
  | { type: 'step-start'; step: WorkflowStep }
  | { type: 'step-progress'; step: WorkflowStep; delta: string }
  | { type: 'step-complete'; step: WorkflowStep }
  | { type: 'step-error'; step: WorkflowStep; error: string }
  | { type: 'workflow-complete'; result: string; state: WorkflowState }
  | { type: 'workflow-error'; error: string; state: WorkflowState };

/**
 * Workflow Progress Callback
 */
export type WorkflowProgressCallback = (event: WorkflowProgressEvent) => void;

/**
 * Workflow Execution Options
 */
export interface WorkflowExecutionOptions {
  /** Conversation ID for message storage */
  conversationId: string;

  /** Initial user input */
  input: string;

  /** Additional context for workflow */
  context?: Record<string, unknown>;

  /** Progress callback */
  onProgress?: WorkflowProgressCallback;

  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
}

/**
 * Workflow Execution Result
 */
export interface WorkflowExecutionResult {
  /** Final result */
  result: string;

  /** Workflow state */
  state: WorkflowState;

  /** All messages generated */
  messages: Message[];

  /** Total tokens used */
  totalTokens: {
    prompt: number;
    completion: number;
    total: number;
  };

  /** Total execution time (ms) */
  executionTime: number;
}

/**
 * Base Workflow Executor
 *
 * Abstract base class for all workflow executors.
 * Provides common functionality for workflow execution, state management,
 * error handling, and retries.
 */
export abstract class WorkflowExecutor {
  protected config: WorkflowConfig;
  protected chatService: ChatService;
  protected messageStore: MessageStore;
  protected state: WorkflowState;

  constructor(
    config: WorkflowConfig,
    chatService: ChatService,
    messageStore: MessageStore,
  ) {
    this.config = config;
    this.chatService = chatService;
    this.messageStore = messageStore;

    this.state = this.createInitialState();
  }

  /**
   * Create initial workflow state
   */
  protected createInitialState(): WorkflowState {
    return {
      executionId: this.generateExecutionId(),
      type: this.config.type,
      status: 'idle',
      steps: [],
      currentStepIndex: 0,
      totalSteps: this.config.agents.length,
      metadata: {},
    };
  }

  /**
   * Generate unique execution ID
   */
  protected generateExecutionId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute the workflow
   *
   * Abstract method to be implemented by specific workflow types
   */
  abstract execute(
    options: WorkflowExecutionOptions,
  ): Promise<WorkflowExecutionResult>;

  /**
   * Execute a single agent step
   */
  protected async executeAgent(
    agent: AgentDefinition,
    input: string,
    conversationId: string,
    onProgress?: WorkflowProgressCallback,
  ): Promise<WorkflowStep> {
    const stepId = `step_${this.state.steps.length + 1}`;
    const startTime = Date.now();

    const step: WorkflowStep = {
      id: stepId,
      agentId: agent.id,
      agentName: agent.name,
      input,
      output: '',
      executionTime: 0,
      timestamp: new Date(),
    };

    // Emit step start event
    if (onProgress) {
      onProgress({ type: 'step-start', step });
    }

    try {
      // Merge agent model config with default
      const modelConfig = {
        ...this.config.defaultModelConfig,
        ...agent.modelConfig,
      };

      // Execute agent using ChatService
      const response = await this.chatService.sendMessageStreaming(
        {
          conversationId,
          message: input,
          systemPrompt: agent.systemPrompt,
          modelConfig,
          maxSteps: agent.maxSteps || 5,
        },
        (event) => {
          // Forward streaming events as progress
          if (event.type === 'chunk' && onProgress) {
            step.output = event.content;
            onProgress({ type: 'step-progress', step, delta: event.delta });
          }
        },
      );

      // Update step with results
      step.output =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      step.executionTime = Date.now() - startTime;
      if (response.metadata?.tokens) {
        step.tokensUsed = {
          prompt: response.metadata.tokens.prompt || 0,
          completion: response.metadata.tokens.completion || 0,
          total: response.metadata.tokens.total || 0,
        };
      }

      // Emit step complete event
      if (onProgress) {
        onProgress({ type: 'step-complete', step });
      }

      return step;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      step.executionTime = Date.now() - startTime;
      step.metadata = { error: errorMessage };

      if (onProgress) {
        onProgress({ type: 'step-error', step, error: errorMessage });
      }

      throw error;
    }
  }

  /**
   * Execute agent with retry logic
   */
  protected async executeAgentWithRetry(
    agent: AgentDefinition,
    input: string,
    conversationId: string,
    onProgress?: WorkflowProgressCallback,
  ): Promise<WorkflowStep> {
    const retry = this.config.retry;

    if (!retry) {
      return this.executeAgent(agent, input, conversationId, onProgress);
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retry.maxRetries; attempt++) {
      try {
        return await this.executeAgent(
          agent,
          input,
          conversationId,
          onProgress,
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        const isRetryable =
          !retry.retryableErrors ||
          retry.retryableErrors.some((pattern) =>
            lastError!.message.includes(pattern),
          );

        if (!isRetryable || attempt === retry.maxRetries) {
          throw lastError;
        }

        // Wait before retry
        if (retry.retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retry.retryDelay));
        }

        if (this.config.debug) {
          console.log(
            `Retrying agent ${agent.name} (attempt ${attempt + 2}/${retry.maxRetries + 1})`,
          );
        }
      }
    }

    throw lastError!;
  }

  /**
   * Update workflow state
   */
  protected updateState(updates: Partial<WorkflowState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
  }

  /**
   * Add step to workflow state
   */
  protected addStep(step: WorkflowStep): void {
    this.state.steps.push(step);
    this.state.currentStepIndex = this.state.steps.length;
  }

  /**
   * Calculate total tokens used
   */
  protected calculateTotalTokens(): {
    prompt: number;
    completion: number;
    total: number;
  } {
    return this.state.steps.reduce(
      (acc, step) => ({
        prompt: acc.prompt + (step.tokensUsed?.prompt || 0),
        completion: acc.completion + (step.tokensUsed?.completion || 0),
        total: acc.total + (step.tokensUsed?.total || 0),
      }),
      { prompt: 0, completion: 0, total: 0 },
    );
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState {
    return { ...this.state };
  }

  /**
   * Cancel workflow execution
   */
  cancel(): void {
    if (this.state.status === 'running') {
      this.updateState({
        status: 'cancelled',
        completedAt: new Date(),
      });
    }
  }

  /**
   * Reset workflow to initial state
   */
  reset(): void {
    this.state = this.createInitialState();
  }
}

/**
 * Workflow Executor Factory
 *
 * Creates appropriate workflow executor based on type
 */
export class WorkflowExecutorFactory {
  static create(
    config: WorkflowConfig,
    chatService: ChatService,
    messageStore: MessageStore,
  ): WorkflowExecutor {
    // Import specific executors dynamically to avoid circular dependencies
    // Implementation will be in specific workflow files
    throw new Error(
      `Workflow executor factory not yet implemented for type: ${config.type}`,
    );
  }
}

/**
 * Workflow Builder
 *
 * Fluent API for building workflow configurations
 */
export class WorkflowBuilder {
  private config: Partial<WorkflowConfig> = {
    agents: [],
  };

  /**
   * Set workflow type
   */
  type(type: WorkflowType): this {
    this.config.type = type;
    return this;
  }

  /**
   * Add an agent to the workflow
   */
  addAgent(agent: AgentDefinition): this {
    this.config.agents = [...(this.config.agents || []), agent];
    return this;
  }

  /**
   * Add multiple agents
   */
  addAgents(agents: AgentDefinition[]): this {
    this.config.agents = [...(this.config.agents || []), ...agents];
    return this;
  }

  /**
   * Set default model configuration
   */
  defaultModel(modelConfig: ModelConfig): this {
    this.config.defaultModelConfig = modelConfig;
    return this;
  }

  /**
   * Set max total steps
   */
  maxSteps(maxSteps: number): this {
    this.config.maxTotalSteps = maxSteps;
    return this;
  }

  /**
   * Configure retry behavior
   */
  withRetry(maxRetries: number, retryDelay: number = 1000): this {
    this.config.retry = {
      maxRetries,
      retryDelay,
    };
    return this;
  }

  /**
   * Set timeout
   */
  timeout(timeout: number): this {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * Enable debug mode
   */
  debug(enabled: boolean = true): this {
    this.config.debug = enabled;
    return this;
  }

  /**
   * Build the workflow configuration
   */
  build(): WorkflowConfig {
    if (!this.config.type) {
      throw new Error('Workflow type is required');
    }

    if (!this.config.agents || this.config.agents.length === 0) {
      throw new Error('At least one agent is required');
    }

    return this.config as WorkflowConfig;
  }
}

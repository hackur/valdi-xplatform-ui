/**
 * SequentialWorkflow
 *
 * Executes agents one after another in sequence, passing the output
 * of each agent as input to the next agent.
 *
 * Use cases:
 * - Multi-step reasoning tasks
 * - Research → Analysis → Summary pipelines
 * - Code generation → Review → Optimization
 * - Translation → Refinement → Quality check
 */

import type {
  WorkflowConfig,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  AgentDefinition} from './AgentWorkflow';
import {
  WorkflowExecutor
} from './AgentWorkflow';
import type { ChatService } from './ChatService';
import type { MessageStore } from './MessageStore';

/**
 * Sequential Workflow Configuration
 */
export interface SequentialWorkflowConfig extends WorkflowConfig {
  type: 'sequential';

  /**
   * Whether to include previous context in each step
   * If true, each agent sees the full conversation history
   * If false, each agent only sees the previous agent's output
   */
  includePreviousContext?: boolean;

  /**
   * Custom output transformer between steps
   * Allows modifying output before passing to next agent
   */
  transformOutput?: (output: string, agentIndex: number) => string;

  /**
   * Early stopping condition
   * Return true to stop workflow early
   */
  shouldStop?: (output: string, agentIndex: number) => boolean;
}

/**
 * Sequential Workflow Executor
 *
 * Executes agents in sequence, where each agent processes the output
 * of the previous agent.
 *
 * Example:
 * ```typescript
 * const workflow = new SequentialWorkflow({
 *   type: 'sequential',
 *   agents: [
 *     {
 *       id: 'researcher',
 *       name: 'Researcher',
 *       role: 'research',
 *       systemPrompt: 'You are a research assistant...',
 *     },
 *     {
 *       id: 'analyst',
 *       name: 'Analyst',
 *       role: 'analysis',
 *       systemPrompt: 'You are a data analyst...',
 *     },
 *     {
 *       id: 'summarizer',
 *       name: 'Summarizer',
 *       role: 'summary',
 *       systemPrompt: 'You are a summarization expert...',
 *     },
 *   ],
 * }, chatService, messageStore);
 *
 * const result = await workflow.execute({
 *   conversationId: 'conv_123',
 *   input: 'Research the impact of AI on healthcare',
 *   onProgress: (event) => console.log(event),
 * });
 * ```
 */
export class SequentialWorkflow extends WorkflowExecutor {
  protected override config: SequentialWorkflowConfig;

  constructor(
    config: SequentialWorkflowConfig,
    chatService: ChatService,
    messageStore: MessageStore,
  ) {
    super(config, chatService, messageStore);
    this.config = config;
  }

  /**
   * Execute the sequential workflow
   */
  override async execute(
    options: WorkflowExecutionOptions,
  ): Promise<WorkflowExecutionResult> {
    const { conversationId, input, onProgress, abortSignal } = options;
    const startTime = Date.now();

    // Initialize state
    this.updateState({
      status: 'running',
      startedAt: new Date(),
      totalSteps: this.config.agents.length,
    });

    // Emit workflow start event
    if (onProgress) {
      onProgress({
        type: 'workflow-start',
        executionId: this.state.executionId,
      });
    }

    try {
      let currentInput = input;

      /*
       * Sequential execution loop
       * Each agent processes the output of the previous agent
       * This creates a processing pipeline where each step refines the result
       */
      for (let i = 0; i < this.config.agents.length; i++) {
        // Check for cancellation before starting each step
        // Allows graceful shutdown of long-running workflows
        if (abortSignal?.aborted) {
          throw new Error('Workflow cancelled by user');
        }

        // Check timeout to prevent infinite execution
        // Timeout is cumulative across all steps in workflow
        if (this.config.timeout) {
          const elapsed = Date.now() - startTime;
          if (elapsed > this.config.timeout) {
            throw new Error('Workflow timeout exceeded');
          }
        }

        const agent = this.config.agents[i];
        if (!agent) {
          throw new Error(`Agent at index ${i} not found`);
        }

        if (this.config.debug) {
          console.log(
            `[SequentialWorkflow] Executing agent ${i + 1}/${this.config.agents.length}: ${agent.name}`,
          );
          console.log(
            `[SequentialWorkflow] Input: ${currentInput.substring(0, 100)}...`,
          );
        }

        // Execute the agent with retry logic
        // Retry provides resilience against transient failures
        const step = await this.executeAgentWithRetry(
          agent,
          currentInput,
          conversationId,
          onProgress,
        );

        // Track step in workflow state for debugging and monitoring
        this.addStep(step);

        // Transform output if transformer is provided
        // Transformer allows custom post-processing (e.g., formatting, filtering)
        let {output} = step;
        if (this.config.transformOutput) {
          output = this.config.transformOutput(output, i);
        }

        // Check early stopping condition
        // Allows workflow to terminate when goal is achieved early
        // Saves API costs and execution time
        if (this.config.shouldStop?.(output, i)) {
          if (this.config.debug) {
            console.log(
              `[SequentialWorkflow] Early stopping condition met at step ${i + 1}`,
            );
          }
          currentInput = output;
          break; // Exit loop early
        }

        /*
         * State transition logic for next agent
         * Two modes of context passing:
         * 1. Full context: Each agent sees all previous outputs
         *    - Better for tasks requiring full history
         *    - Higher token usage
         * 2. Chain mode: Each agent only sees previous output
         *    - Better for simple transformations
         *    - Lower token usage
         */
        if (i < this.config.agents.length - 1) {
          if (this.config.includePreviousContext) {
            // Include full context from previous steps
            // This provides complete history for context-aware processing
            const previousOutputs = this.state.steps
              .map((s, idx) => `Step ${idx + 1} (${s.agentName}): ${s.output}`)
              .join('\n\n');
            currentInput = `${previousOutputs}\n\nNow process the following:\n${input}`;
          } else {
            // Only use the output from the previous step (chain mode)
            // This implements a simple processing pipeline
            currentInput = output;
          }
        } else {
          // Last step - store final output
          currentInput = output;
        }
      }

      // Mark workflow as completed
      const finalResult = currentInput;
      const executionTime = Date.now() - startTime;

      this.updateState({
        status: 'completed',
        result: finalResult,
        completedAt: new Date(),
      });

      const totalTokens = this.calculateTotalTokens();

      // Emit workflow complete event
      if (onProgress) {
        onProgress({
          type: 'workflow-complete',
          result: finalResult,
          state: this.state,
        });
      }

      return {
        result: finalResult,
        state: this.state,
        messages: this.messageStore.getMessages(conversationId),
        totalTokens,
        executionTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.updateState({
        status: 'error',
        error: errorMessage,
        completedAt: new Date(),
      });

      // Emit workflow error event
      if (onProgress) {
        onProgress({
          type: 'workflow-error',
          error: errorMessage,
          state: this.state,
        });
      }

      throw error;
    }
  }

  /**
   * Get the output from a specific step
   */
  getStepOutput(stepIndex: number): string | undefined {
    return this.state.steps[stepIndex]?.output;
  }

  /**
   * Get all step outputs
   */
  getAllOutputs(): string[] {
    return this.state.steps.map((step) => step.output);
  }

  /**
   * Get step by agent ID
   */
  getStepByAgentId(agentId: string): (typeof this.state.steps)[0] | undefined {
    return this.state.steps.find((step) => step.agentId === agentId);
  }
}

/**
 * Sequential Workflow Builder
 *
 * Convenience builder for creating sequential workflows
 */
export class SequentialWorkflowBuilder {
  private readonly agents: AgentDefinition[] = [];
  private readonly config: Partial<SequentialWorkflowConfig> = {
    type: 'sequential',
  };

  /**
   * Add a research agent
   */
  research(
    systemPrompt: string,
    modelConfig?: AgentDefinition['modelConfig'],
  ): this {
    this.agents.push({
      id: 'researcher',
      name: 'Researcher',
      role: 'research',
      systemPrompt,
      modelConfig,
    });
    return this;
  }

  /**
   * Add an analysis agent
   */
  analyze(
    systemPrompt: string,
    modelConfig?: AgentDefinition['modelConfig'],
  ): this {
    this.agents.push({
      id: 'analyst',
      name: 'Analyst',
      role: 'analysis',
      systemPrompt,
      modelConfig,
    });
    return this;
  }

  /**
   * Add a summarization agent
   */
  summarize(
    systemPrompt: string,
    modelConfig?: AgentDefinition['modelConfig'],
  ): this {
    this.agents.push({
      id: 'summarizer',
      name: 'Summarizer',
      role: 'summary',
      systemPrompt,
      modelConfig,
    });
    return this;
  }

  /**
   * Add a custom agent
   */
  custom(agent: AgentDefinition): this {
    this.agents.push(agent);
    return this;
  }

  /**
   * Include previous context in each step
   */
  withContext(): this {
    this.config.includePreviousContext = true;
    return this;
  }

  /**
   * Add output transformer
   */
  transform(transformer: (output: string, agentIndex: number) => string): this {
    this.config.transformOutput = transformer;
    return this;
  }

  /**
   * Add early stopping condition
   */
  stopWhen(condition: (output: string, agentIndex: number) => boolean): this {
    this.config.shouldStop = condition;
    return this;
  }

  /**
   * Enable debug logging
   */
  debug(): this {
    this.config.debug = true;
    return this;
  }

  /**
   * Build the workflow configuration
   */
  build(): SequentialWorkflowConfig {
    if (this.agents.length === 0) {
      throw new Error('At least one agent is required');
    }

    return {
      ...this.config,
      type: 'sequential',
      agents: this.agents,
    } as SequentialWorkflowConfig;
  }

  /**
   * Build and create executor
   */
  buildExecutor(
    chatService: ChatService,
    messageStore: MessageStore,
  ): SequentialWorkflow {
    return new SequentialWorkflow(this.build(), chatService, messageStore);
  }
}

/**
 * Helper function to create a sequential workflow
 */
export function createSequentialWorkflow(
  agents: AgentDefinition[],
  options?: Partial<SequentialWorkflowConfig>,
): SequentialWorkflowConfig {
  return {
    type: 'sequential',
    agents,
    ...options,
  };
}

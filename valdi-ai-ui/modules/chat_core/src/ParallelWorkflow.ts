/**
 * ParallelWorkflow
 *
 * Executes multiple agents simultaneously and combines their results.
 * Each agent processes the same input independently, and results are
 * aggregated using a specified strategy.
 *
 * Use cases:
 * - Multi-perspective analysis
 * - Ensemble predictions
 * - Comparative evaluations
 * - Parallel research from different viewpoints
 * - Consensus building
 */

import {
  WorkflowExecutor,
  WorkflowConfig,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  WorkflowStep,
} from './AgentWorkflow';
import { ChatService } from './ChatService';
import { MessageStore } from './MessageStore';

/**
 * Result Aggregation Strategy
 */
export type AggregationStrategy =
  | 'concatenate'    // Concatenate all outputs
  | 'vote'           // Vote on most common result
  | 'first'          // Use first completed result
  | 'custom';        // Use custom aggregator function

/**
 * Parallel Workflow Configuration
 */
export interface ParallelWorkflowConfig extends WorkflowConfig {
  type: 'parallel';

  /**
   * How to aggregate results from parallel agents
   */
  aggregationStrategy?: AggregationStrategy;

  /**
   * Custom aggregation function
   * Combines outputs from all agents into a single result
   */
  aggregateResults?: (outputs: string[], steps: WorkflowStep[]) => string;

  /**
   * Optional synthesizer agent to process aggregated results
   */
  synthesizerAgent?: {
    id: string;
    name: string;
    role: string;
    systemPrompt: string;
    modelConfig?: any;
  };

  /**
   * Whether to wait for all agents to complete
   * If false, returns as soon as one agent completes (race mode)
   */
  waitForAll?: boolean;

  /**
   * Maximum time to wait for all agents (ms)
   * If specified and exceeded, uses results from completed agents only
   */
  maxWaitTime?: number;

  /**
   * Minimum number of agents that must complete successfully
   */
  minSuccessfulAgents?: number;
}

/**
 * Parallel Workflow Executor
 *
 * Executes multiple agents in parallel and aggregates their results.
 *
 * Example:
 * ```typescript
 * const workflow = new ParallelWorkflow({
 *   type: 'parallel',
 *   agents: [
 *     {
 *       id: 'optimist',
 *       name: 'Optimistic Analyst',
 *       role: 'optimistic-analysis',
 *       systemPrompt: 'You are an optimistic analyst. Focus on positive aspects...',
 *     },
 *     {
 *       id: 'pessimist',
 *       name: 'Critical Analyst',
 *       role: 'critical-analysis',
 *       systemPrompt: 'You are a critical analyst. Focus on risks and challenges...',
 *     },
 *     {
 *       id: 'realist',
 *       name: 'Balanced Analyst',
 *       role: 'balanced-analysis',
 *       systemPrompt: 'You are a balanced analyst. Provide objective analysis...',
 *     },
 *   ],
 *   aggregationStrategy: 'concatenate',
 *   synthesizerAgent: {
 *     id: 'synthesizer',
 *     name: 'Synthesizer',
 *     role: 'synthesis',
 *     systemPrompt: 'Synthesize the following perspectives into a coherent analysis...',
 *   },
 * }, chatService, messageStore);
 * ```
 */
export class ParallelWorkflow extends WorkflowExecutor {
  protected config: ParallelWorkflowConfig;

  constructor(
    config: ParallelWorkflowConfig,
    chatService: ChatService,
    messageStore: MessageStore
  ) {
    super(config, chatService, messageStore);
    this.config = config;
  }

  /**
   * Execute the parallel workflow
   */
  async execute(options: WorkflowExecutionOptions): Promise<WorkflowExecutionResult> {
    const { conversationId, input, onProgress, abortSignal } = options;
    const startTime = Date.now();

    // Initialize state
    const totalSteps = this.config.agents.length + (this.config.synthesizerAgent ? 1 : 0);
    this.updateState({
      status: 'running',
      startedAt: new Date(),
      totalSteps,
    });

    // Emit workflow start event
    if (onProgress) {
      onProgress({
        type: 'workflow-start',
        executionId: this.state.executionId,
      });
    }

    try {
      // Execute all agents in parallel
      const agentPromises = this.config.agents.map(async (agent) => {
        // Check for cancellation
        if (abortSignal?.aborted) {
          throw new Error('Workflow cancelled by user');
        }

        try {
          if (this.config.debug) {
            console.log(`[ParallelWorkflow] Starting agent: ${agent.name}`);
          }

          const step = await this.executeAgentWithRetry(
            agent,
            input,
            conversationId,
            onProgress
          );

          return { success: true, step };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (this.config.debug) {
            console.error(`[ParallelWorkflow] Agent ${agent.name} failed: ${errorMessage}`);
          }

          return {
            success: false,
            error: errorMessage,
            agent,
          };
        }
      });

      // Wait for agents with timeout if specified
      let results: Awaited<typeof agentPromises[0]>[];

      if (this.config.waitForAll !== false) {
        if (this.config.maxWaitTime) {
          // Wait with timeout
          results = await Promise.race([
            Promise.all(agentPromises),
            new Promise<any[]>((_, reject) =>
              setTimeout(() => reject(new Error('Max wait time exceeded')), this.config.maxWaitTime)
            ),
          ]).catch(() => {
            // On timeout, get results from completed promises
            if (this.config.debug) {
              console.log('[ParallelWorkflow] Max wait time exceeded, using partial results');
            }
            return Promise.allSettled(agentPromises).then(settled =>
              settled
                .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
                .map(r => r.value)
            );
          });
        } else {
          // Wait for all without timeout
          results = await Promise.all(agentPromises);
        }
      } else {
        // Race mode - return as soon as first agent completes
        const firstResult = await Promise.race(agentPromises);
        results = [firstResult];
      }

      // Filter successful results
      const successfulResults = results.filter(r => r.success);
      const failedCount = results.length - successfulResults.length;

      // Check minimum successful agents requirement
      const minRequired = this.config.minSuccessfulAgents || 1;
      if (successfulResults.length < minRequired) {
        throw new Error(
          `Insufficient successful agents: ${successfulResults.length}/${minRequired} required. ` +
          `${failedCount} agent(s) failed.`
        );
      }

      // Add all successful steps to state
      successfulResults.forEach(result => {
        this.addStep(result.step);
      });

      // Aggregate results
      const outputs = successfulResults.map(r => r.step.output);
      const steps = successfulResults.map(r => r.step);

      let aggregatedResult = this.aggregateOutputs(outputs, steps);

      // If synthesizer agent is provided, use it to process aggregated results
      if (this.config.synthesizerAgent) {
        if (this.config.debug) {
          console.log('[ParallelWorkflow] Running synthesizer agent');
        }

        const synthesizerStep = await this.executeAgentWithRetry(
          this.config.synthesizerAgent,
          `Please synthesize the following outputs:\n\n${aggregatedResult}`,
          conversationId,
          onProgress
        );

        this.addStep(synthesizerStep);
        aggregatedResult = synthesizerStep.output;
      }

      // Mark workflow as completed
      const executionTime = Date.now() - startTime;

      this.updateState({
        status: 'completed',
        result: aggregatedResult,
        completedAt: new Date(),
        metadata: {
          ...this.state.metadata,
          successfulAgents: successfulResults.length,
          failedAgents: failedCount,
        },
      });

      const totalTokens = this.calculateTotalTokens();

      // Emit workflow complete event
      if (onProgress) {
        onProgress({
          type: 'workflow-complete',
          result: aggregatedResult,
          state: this.state,
        });
      }

      return {
        result: aggregatedResult,
        state: this.state,
        messages: this.messageStore.getMessages(conversationId),
        totalTokens,
        executionTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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
   * Aggregate outputs using the configured strategy
   */
  private aggregateOutputs(outputs: string[], steps: WorkflowStep[]): string {
    const strategy = this.config.aggregationStrategy || 'concatenate';

    // Use custom aggregator if provided
    if (strategy === 'custom' && this.config.aggregateResults) {
      return this.config.aggregateResults(outputs, steps);
    }

    switch (strategy) {
      case 'concatenate':
        return outputs
          .map((output, index) => {
            const agentName = steps[index].agentName;
            return `## ${agentName}\n\n${output}`;
          })
          .join('\n\n---\n\n');

      case 'vote':
        // Simple voting: find most common output
        const votes = new Map<string, number>();
        outputs.forEach(output => {
          const normalized = output.trim().toLowerCase();
          votes.set(normalized, (votes.get(normalized) || 0) + 1);
        });

        let maxVotes = 0;
        let winner = outputs[0];
        votes.forEach((count, output) => {
          if (count > maxVotes) {
            maxVotes = count;
            winner = output;
          }
        });

        return winner;

      case 'first':
        return outputs[0];

      default:
        return outputs.join('\n\n');
    }
  }

  /**
   * Get outputs from all parallel agents
   */
  getParallelOutputs(): Array<{ agentName: string; output: string }> {
    return this.state.steps
      .filter(step => step.agentId !== this.config.synthesizerAgent?.id)
      .map(step => ({
        agentName: step.agentName,
        output: step.output,
      }));
  }

  /**
   * Get synthesized output (if synthesizer was used)
   */
  getSynthesizedOutput(): string | undefined {
    if (!this.config.synthesizerAgent) {
      return undefined;
    }

    const synthesizerStep = this.state.steps.find(
      step => step.agentId === this.config.synthesizerAgent!.id
    );

    return synthesizerStep?.output;
  }
}

/**
 * Parallel Workflow Builder
 *
 * Convenience builder for creating parallel workflows
 */
export class ParallelWorkflowBuilder {
  private config: Partial<ParallelWorkflowConfig> = {
    type: 'parallel',
    agents: [],
    waitForAll: true,
  };

  /**
   * Add an agent to execute in parallel
   */
  addAgent(agent: any): this {
    this.config.agents = [...(this.config.agents || []), agent];
    return this;
  }

  /**
   * Set aggregation strategy
   */
  aggregate(strategy: AggregationStrategy): this {
    this.config.aggregationStrategy = strategy;
    return this;
  }

  /**
   * Set custom aggregation function
   */
  customAggregator(fn: (outputs: string[], steps: WorkflowStep[]) => string): this {
    this.config.aggregationStrategy = 'custom';
    this.config.aggregateResults = fn;
    return this;
  }

  /**
   * Add synthesizer agent
   */
  synthesize(agent: ParallelWorkflowConfig['synthesizerAgent']): this {
    this.config.synthesizerAgent = agent;
    return this;
  }

  /**
   * Enable race mode (return first result)
   */
  race(): this {
    this.config.waitForAll = false;
    return this;
  }

  /**
   * Set max wait time
   */
  maxWait(milliseconds: number): this {
    this.config.maxWaitTime = milliseconds;
    return this;
  }

  /**
   * Set minimum successful agents
   */
  requireMin(count: number): this {
    this.config.minSuccessfulAgents = count;
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
  build(): ParallelWorkflowConfig {
    if (!this.config.agents || this.config.agents.length === 0) {
      throw new Error('At least one agent is required');
    }

    return this.config as ParallelWorkflowConfig;
  }

  /**
   * Build and create executor
   */
  buildExecutor(chatService: ChatService, messageStore: MessageStore): ParallelWorkflow {
    return new ParallelWorkflow(this.build(), chatService, messageStore);
  }
}

/**
 * Helper function to create a parallel workflow
 */
export function createParallelWorkflow(
  agents: any[],
  options?: Partial<ParallelWorkflowConfig>
): ParallelWorkflowConfig {
  return {
    type: 'parallel',
    agents,
    waitForAll: true,
    ...options,
  };
}

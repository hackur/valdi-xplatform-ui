/**
 * LoopController
 *
 * Controls iterative agent loops with stop conditions and timeout management.
 * Useful for workflows that need to repeat until a condition is met.
 */

import {
  AgentDefinition,
  AgentContext,
  AgentExecutionResult,
  LoopControlConfig,
  LoopExecutionState,
} from './types';
import { AgentRegistry } from './AgentRegistry';
import { WorkflowEngine } from './WorkflowEngine';

/**
 * Loop Controller Class
 *
 * Manages iterative execution of agents or workflows.
 * Provides fine-grained control over loop termination.
 */
export class LoopController {
  private registry: AgentRegistry;
  private workflowEngine: WorkflowEngine;
  private state: LoopExecutionState | null = null;

  constructor(registry: AgentRegistry, workflowEngine: WorkflowEngine) {
    this.registry = registry;
    this.workflowEngine = workflowEngine;
  }

  /**
   * Execute a loop
   * @param agentId Agent to execute in loop
   * @param context Initial context
   * @param config Loop configuration
   * @returns Final loop state
   */
  async executeLoop(
    agentId: string,
    context: AgentContext,
    config: LoopControlConfig,
  ): Promise<LoopExecutionState> {
    // Initialize state
    this.state = {
      iteration: 0,
      startTime: new Date(),
      isRunning: true,
      isStopped: false,
      iterationResults: [],
      totalTime: 0,
    };

    const agent = this.registry.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    console.log(`[LoopController] Starting loop with agent: ${agent.name}`);
    console.log(`[LoopController] Max iterations: ${config.maxIterations}`);

    let currentContext = { ...context };

    try {
      while (
        this.state.iteration < config.maxIterations &&
        this.state.isRunning
      ) {
        const iterationStart = Date.now();
        this.state.iteration++;

        console.log(
          `[LoopController] Iteration ${this.state.iteration}/${config.maxIterations}`,
        );

        // Check total timeout
        if (config.totalTimeout) {
          const elapsed = Date.now() - this.state.startTime.getTime();
          if (elapsed >= config.totalTimeout) {
            console.log(`[LoopController] Total timeout reached: ${elapsed}ms`);
            break;
          }
        }

        // Execute agent with timeout
        const result = await this.executeWithTimeout(
          () => this.executeAgent(agent, currentContext),
          config.iterationTimeout || 30000,
        );

        this.state.iterationResults.push(result);

        // Call iteration callback
        if (config.onIteration) {
          config.onIteration(this.state.iteration, result);
        }

        // Check min iterations
        const pastMinIterations =
          !config.minIterations || this.state.iteration >= config.minIterations;

        // Check stop condition
        if (pastMinIterations && config.stopWhen) {
          const shouldStop = config.stopWhen(
            this.state.iteration,
            this.state.iterationResults,
          );

          if (shouldStop) {
            console.log(
              `[LoopController] Stop condition met at iteration ${this.state.iteration}`,
            );
            break;
          }
        }

        // Update context with results
        if (result.messages.length > 0) {
          currentContext.messages = [
            ...currentContext.messages,
            ...result.messages,
          ];
        }

        // Track iteration time
        const iterationTime = Date.now() - iterationStart;
        console.log(
          `[LoopController] Iteration ${this.state.iteration} completed in ${iterationTime}ms`,
        );
      }

      this.state.isRunning = false;
      this.state.totalTime = Date.now() - this.state.startTime.getTime();

      console.log(
        `[LoopController] Loop completed: ${this.state.iteration} iterations in ${this.state.totalTime}ms`,
      );

      // Call complete callback
      if (config.onComplete) {
        config.onComplete(this.state.iterationResults);
      }

      return this.state;
    } catch (error) {
      this.state.isRunning = false;
      this.state.totalTime = Date.now() - this.state.startTime.getTime();

      console.error(`[LoopController] Loop failed:`, error);

      // Call error callback
      if (config.onError) {
        config.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      throw error;
    }
  }

  /**
   * Stop the loop
   */
  stop(): void {
    if (this.state && this.state.isRunning) {
      console.log(
        `[LoopController] Stopping loop at iteration ${this.state.iteration}`,
      );
      this.state.isRunning = false;
      this.state.isStopped = true;
    }
  }

  /**
   * Get current loop state
   */
  getState(): LoopExecutionState | null {
    return this.state;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${timeout}ms`)),
          timeout,
        ),
      ),
    ]);
  }

  /**
   * Execute a single agent
   * Note: This duplicates logic from WorkflowEngine
   * In a real implementation, this would be refactored into a shared service
   */
  private async executeAgent(
    agent: AgentDefinition,
    context: AgentContext,
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // For now, return a mock result
      // In a real implementation, this would use ChatService
      await new Promise((resolve) => setTimeout(resolve, 100));

      const executionTime = Date.now() - startTime;

      return {
        agentId: agent.id,
        messages: [],
        metadata: {
          steps: 1,
          executionTime,
          finishReason: 'completed',
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        agentId: agent.id,
        messages: [],
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          steps: 0,
          executionTime,
          finishReason: 'error',
        },
      };
    }
  }
}

/**
 * Create a simple stop condition based on keyword
 */
export function createKeywordStopCondition(
  keyword: string,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (iteration, results) => {
    if (results.length === 0) {
      return false;
    }

    const lastResult = results[results.length - 1];
    if (lastResult.messages.length === 0) {
      return false;
    }

    const lastMessage = lastResult.messages[lastResult.messages.length - 1];
    const content =
      typeof lastMessage.content === 'string' ? lastMessage.content : '';

    return content.toLowerCase().includes(keyword.toLowerCase());
  };
}

/**
 * Create a stop condition based on iteration count
 */
export function createIterationStopCondition(
  maxIterations: number,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (iteration) => iteration >= maxIterations;
}

/**
 * Create a stop condition based on success criteria
 */
export function createSuccessStopCondition(
  evaluator: (result: AgentExecutionResult) => boolean,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (iteration, results) => {
    if (results.length === 0) {
      return false;
    }

    const lastResult = results[results.length - 1];
    return evaluator(lastResult);
  };
}

/**
 * LoopController
 *
 * Controls iterative agent loops with stop conditions and timeout management.
 * Useful for workflows that need to repeat until a condition is met.
 * Production-ready with comprehensive error handling and cancellation support.
 */

import type {
  AgentContext,
  AgentExecutionResult,
  LoopControlConfig,
  LoopExecutionState,
} from './types';
import type { AgentRegistry } from './AgentRegistry';
import type { AgentExecutor } from './AgentExecutor';

/**
 * Loop Controller Configuration
 */
export interface LoopControllerConfig {
  /** Agent registry */
  registry: AgentRegistry;

  /** Agent executor */
  executor: AgentExecutor;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Loop Controller Class
 *
 * Manages iterative execution of agents or workflows.
 * Provides fine-grained control over loop termination.
 */
export class LoopController {
  private readonly registry: AgentRegistry;
  private readonly executor: AgentExecutor;
  private readonly debug: boolean;
  private readonly activeLoops: Map<string, LoopExecutionState> = new Map();
  private readonly abortControllers: Map<string, AbortController> = new Map();

  constructor(config: LoopControllerConfig) {
    this.registry = config.registry;
    this.executor = config.executor;
    this.debug = config.debug ?? false;
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
    const loopId = `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize state
    const state: LoopExecutionState = {
      iteration: 0,
      startTime: new Date(),
      isRunning: true,
      isStopped: false,
      iterationResults: [],
      totalTime: 0,
    };

    // Create abort controller
    const abortController = new AbortController();
    this.abortControllers.set(loopId, abortController);
    this.activeLoops.set(loopId, state);

    const agent = this.registry.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    this.log(`Starting loop with agent: ${agent.name}`);
    this.log(`Max iterations: ${config.maxIterations}`);

    const currentContext = { ...context };

    try {
      while (
        state.iteration < config.maxIterations &&
        state.isRunning &&
        !abortController.signal.aborted
      ) {
        const iterationStart = Date.now();
        state.iteration++;

        this.log(`Iteration ${state.iteration}/${config.maxIterations}`);

        // Check total timeout
        if (config.totalTimeout) {
          const elapsed = Date.now() - state.startTime.getTime();
          if (elapsed >= config.totalTimeout) {
            this.log(`Total timeout reached: ${elapsed}ms`);
            state.isStopped = true;
            break;
          }
        }

        // Execute agent
        let result: AgentExecutionResult;

        try {
          result = await this.executor.execute(agent, currentContext, {
            timeout: config.iterationTimeout,
            abortSignal: abortController.signal,
          });

          // Check if execution failed
          if (result.error) {
            this.log(`Iteration ${state.iteration} failed: ${result.error}`);

            // Call error callback
            if (config.onError) {
              config.onError(new Error(result.error));
            }

            // Decide whether to continue based on error
            // For now, we'll stop on error
            state.isStopped = true;
            state.iterationResults.push(result);
            break;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.log(`Iteration ${state.iteration} threw error: ${errorMessage}`);

          // Call error callback
          if (config.onError) {
            config.onError(
              error instanceof Error ? error : new Error(errorMessage),
            );
          }

          // Create error result
          result = {
            agentId: agent.id,
            messages: [],
            error: errorMessage,
            metadata: {
              steps: 0,
              executionTime: Date.now() - iterationStart,
              finishReason: 'error',
            },
          };

          state.iterationResults.push(result);
          state.isStopped = true;
          break;
        }

        state.iterationResults.push(result);

        // Call iteration callback
        if (config.onIteration) {
          config.onIteration(state.iteration, result);
        }

        // Check min iterations
        const pastMinIterations =
          !config.minIterations || state.iteration >= config.minIterations;

        // Check stop condition
        if (pastMinIterations && config.stopWhen) {
          const shouldStop = config.stopWhen(
            state.iteration,
            state.iterationResults,
          );

          if (shouldStop) {
            this.log(`Stop condition met at iteration ${state.iteration}`);
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

        // Pass output to next iteration
        if (result.output) {
          currentContext.sharedData = {
            ...currentContext.sharedData,
            previousOutput: result.output,
            previousIteration: state.iteration,
            iterationResults: state.iterationResults,
          };
        }

        // Track iteration time
        const iterationTime = Date.now() - iterationStart;
        this.log(
          `Iteration ${state.iteration} completed in ${iterationTime}ms`,
        );
      }

      state.isRunning = false;
      state.totalTime = Date.now() - state.startTime.getTime();

      this.log(
        `Loop completed: ${state.iteration} iterations in ${state.totalTime}ms`,
      );

      // Call complete callback
      if (config.onComplete) {
        config.onComplete(state.iterationResults);
      }

      return state;
    } catch (error) {
      state.isRunning = false;
      state.totalTime = Date.now() - state.startTime.getTime();

      this.log(
        `Loop failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Call error callback
      if (config.onError) {
        config.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      throw error;
    } finally {
      this.activeLoops.delete(loopId);
      this.abortControllers.delete(loopId);
    }
  }

  /**
   * Execute multiple loops in sequence
   * @param agents Array of agent IDs to loop through
   * @param context Initial context
   * @param config Loop configuration
   * @returns Array of loop states
   */
  async executeMultipleLoops(
    agents: string[],
    context: AgentContext,
    config: LoopControlConfig,
  ): Promise<LoopExecutionState[]> {
    const states: LoopExecutionState[] = [];
    const currentContext = { ...context };

    for (const agentId of agents) {
      const state = await this.executeLoop(agentId, currentContext, config);
      states.push(state);

      // Pass results to next loop
      if (state.iterationResults.length > 0) {
        const lastResult =
          state.iterationResults[state.iterationResults.length - 1];
        if (lastResult && lastResult.messages.length > 0) {
          currentContext.messages = [
            ...currentContext.messages,
            ...lastResult.messages,
          ];
        }
        if (lastResult?.output) {
          currentContext.sharedData = {
            ...currentContext.sharedData,
            previousLoopOutput: lastResult.output,
            previousAgentId: agentId,
          };
        }
      }
    }

    return states;
  }

  /**
   * Execute loop until a specific output is achieved
   * @param agentId Agent ID
   * @param context Context
   * @param targetCondition Condition to check output against
   * @param maxIterations Max iterations
   * @returns Loop state
   */
  async executeUntil(
    agentId: string,
    context: AgentContext,
    targetCondition: (output: unknown) => boolean,
    maxIterations: number = 10,
  ): Promise<LoopExecutionState> {
    return this.executeLoop(agentId, context, {
      maxIterations,
      stopWhen: (_iteration, results) => {
        if (results.length === 0) {
          return false;
        }

        const lastResult = results[results.length - 1];
        return (
          lastResult?.output !== undefined &&
          targetCondition(lastResult.output)
        );
      },
    });
  }

  /**
   * Get all active loops
   * @returns Array of active loop states
   */
  getActiveLoops(): LoopExecutionState[] {
    return Array.from(this.activeLoops.values());
  }

  /**
   * Stop a specific loop
   * @param loopId Loop ID to stop
   * @returns True if loop was stopped
   */
  stopLoop(loopId: string): boolean {
    const abortController = this.abortControllers.get(loopId);
    const state = this.activeLoops.get(loopId);

    if (!abortController || !state) {
      return false;
    }

    abortController.abort();
    state.isRunning = false;
    state.isStopped = true;

    this.log(`Stopped loop: ${loopId}`);
    return true;
  }

  /**
   * Stop all active loops
   * @returns Number of loops stopped
   */
  stopAllLoops(): number {
    const count = this.activeLoops.size;

    for (const loopId of this.activeLoops.keys()) {
      this.stopLoop(loopId);
    }

    this.log(`Stopped ${count} loops`);
    return count;
  }

  /**
   * Check if any loops are active
   * @returns True if loops are running
   */
  hasActiveLoops(): boolean {
    return this.activeLoops.size > 0;
  }

  /**
   * Get count of active loops
   * @returns Number of active loops
   */
  getActiveCount(): number {
    return this.activeLoops.size;
  }

  /**
   * Log message if debug is enabled
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[LoopController] ${message}`);
    }
  }
}

/**
 * Create a simple stop condition based on keyword
 * @param keyword Keyword to search for in message content
 * @returns Stop condition function
 */
export function createKeywordStopCondition(
  keyword: string,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (_iteration, results) => {
    if (results.length === 0) {
      return false;
    }

    const lastResult = results[results.length - 1];
    if (!lastResult || lastResult.messages.length === 0) {
      return false;
    }

    const lastMessage = lastResult.messages[lastResult.messages.length - 1];
    if (!lastMessage) {
      return false;
    }

    const content =
      typeof lastMessage.content === 'string' ? lastMessage.content : '';

    return content.toLowerCase().includes(keyword.toLowerCase());
  };
}

/**
 * Create a stop condition based on iteration count
 * @param maxIterations Maximum iterations
 * @returns Stop condition function
 */
export function createIterationStopCondition(
  maxIterations: number,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (iteration) => iteration >= maxIterations;
}

/**
 * Create a stop condition based on success criteria
 * @param evaluator Function to evaluate if result is successful
 * @returns Stop condition function
 */
export function createSuccessStopCondition(
  evaluator: (result: AgentExecutionResult) => boolean,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (_iteration, results) => {
    if (results.length === 0) {
      return false;
    }

    const lastResult = results[results.length - 1];
    if (!lastResult) {
      return false;
    }
    return evaluator(lastResult);
  };
}

/**
 * Create a stop condition based on error threshold
 * @param maxErrors Maximum number of consecutive errors before stopping
 * @returns Stop condition function
 */
export function createErrorThresholdStopCondition(
  maxErrors: number,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  return (_iteration, results) => {
    if (results.length < maxErrors) {
      return false;
    }

    // Check last N results for errors
    const recentResults = results.slice(-maxErrors);
    return recentResults.every((result) => result.error !== undefined);
  };
}

/**
 * Create a stop condition based on output stability
 * @param stableIterations Number of iterations with same output to consider stable
 * @param comparator Optional custom comparator for outputs
 * @returns Stop condition function
 */
export function createStabilityStopCondition(
  stableIterations: number,
  comparator?: (a: unknown, b: unknown) => boolean,
): (iteration: number, results: AgentExecutionResult[]) => boolean {
  const defaultComparator = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);

  const compare = comparator || defaultComparator;

  return (_iteration, results) => {
    if (results.length < stableIterations) {
      return false;
    }

    const recentResults = results.slice(-stableIterations);

    // Check if all outputs are the same
    const firstResult = recentResults[0];
    if (!firstResult) {
      return false;
    }
    const firstOutput = firstResult.output;
    return recentResults.every((result) => compare(result.output, firstOutput));
  };
}

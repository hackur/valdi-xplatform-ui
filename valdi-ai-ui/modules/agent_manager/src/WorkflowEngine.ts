/**
 * WorkflowEngine
 *
 * Orchestrates multi-agent workflows with different execution patterns.
 * Manages workflow lifecycle and coordinates agent execution.
 * Supports cancellation, progress tracking, and error recovery.
 */

import {
  AgentDefinition,
  AgentContext,
  AgentExecutionResult,
  WorkflowConfig,
  WorkflowExecutionState,
} from './types';
import { AgentRegistry } from './AgentRegistry';
import { AgentExecutor } from './AgentExecutor';

/**
 * Workflow progress callback
 */
export type WorkflowProgressCallback = (state: WorkflowExecutionState) => void;

/**
 * Workflow execution options
 */
export interface WorkflowExecutionOptions {
  /** Progress callback */
  onProgress?: WorkflowProgressCallback;

  /** Error recovery strategy */
  errorRecovery?: 'stop' | 'continue' | 'retry';

  /** Max retries per agent (if errorRecovery is 'retry') */
  maxRetries?: number;

  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
}

/**
 * Workflow Engine Configuration
 */
export interface WorkflowEngineConfig {
  /** Agent registry */
  registry: AgentRegistry;

  /** Agent executor */
  executor: AgentExecutor;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Workflow Engine Class
 *
 * Manages workflow execution and agent coordination.
 */
export class WorkflowEngine {
  private registry: AgentRegistry;
  private executor: AgentExecutor;
  private debug: boolean;
  private activeWorkflows: Map<string, WorkflowExecutionState> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: WorkflowEngineConfig) {
    this.registry = config.registry;
    this.executor = config.executor;
    this.debug = config.debug ?? false;
  }

  /**
   * Execute a workflow
   * @param config Workflow configuration
   * @param context Execution context
   * @param options Execution options
   * @returns Workflow execution state
   */
  async execute(
    config: WorkflowConfig,
    context: AgentContext,
    options?: WorkflowExecutionOptions,
  ): Promise<WorkflowExecutionState> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const state: WorkflowExecutionState = {
      id: workflowId,
      config,
      status: 'running',
      startTime: new Date(),
      currentStep: 0,
      results: [],
    };

    // Create abort controller for this workflow
    const abortController = new AbortController();
    this.abortControllers.set(workflowId, abortController);

    // Listen to external abort signal if provided
    if (options?.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        abortController.abort();
      });
    }

    this.activeWorkflows.set(workflowId, state);

    try {
      this.log(`Starting workflow: ${config.name} (${config.type})`);

      // Check if already aborted
      if (abortController.signal.aborted) {
        throw new Error('Workflow cancelled before start');
      }

      // Set up timeout
      const timeoutPromise = config.timeout
        ? new Promise<never>((_, reject) => {
            setTimeout(
              () =>
                reject(new Error(`Workflow timeout after ${config.timeout}ms`)),
              config.timeout,
            );
          })
        : null;

      // Execute workflow
      const executionPromise = this.executeWorkflow(
        state,
        context,
        options,
        abortController.signal,
      );

      if (timeoutPromise) {
        await Promise.race([executionPromise, timeoutPromise]);
      } else {
        await executionPromise;
      }

      // Check final status
      if (abortController.signal.aborted) {
        state.status = 'stopped';
      } else {
        state.status = 'completed';
      }

      state.endTime = new Date();

      this.log(
        `Completed workflow: ${config.name} in ${state.endTime.getTime() - state.startTime.getTime()}ms`,
      );

      // Final progress callback
      if (options?.onProgress) {
        options.onProgress(state);
      }
    } catch (error) {
      this.log(
        `Workflow failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('timeout')) {
        state.status = 'timeout';
      } else if (
        errorMessage.includes('cancel') ||
        errorMessage.includes('abort')
      ) {
        state.status = 'stopped';
      } else {
        state.status = 'failed';
      }

      state.error = errorMessage;
      state.endTime = new Date();

      // Error progress callback
      if (options?.onProgress) {
        options.onProgress(state);
      }
    } finally {
      this.activeWorkflows.delete(workflowId);
      this.abortControllers.delete(workflowId);
    }

    return state;
  }

  /**
   * Execute workflow based on type
   */
  private async executeWorkflow(
    state: WorkflowExecutionState,
    context: AgentContext,
    options: WorkflowExecutionOptions | undefined,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const { config } = state;

    switch (config.type) {
      case 'sequential':
        await this.executeSequential(state, context, options, abortSignal);
        break;

      case 'parallel':
        await this.executeParallel(state, context, options, abortSignal);
        break;

      case 'routing':
        await this.executeRouting(state, context, options, abortSignal);
        break;

      case 'evaluator-optimizer':
        await this.executeEvaluatorOptimizer(
          state,
          context,
          options,
          abortSignal,
        );
        break;

      default:
        throw new Error(`Unknown workflow type: ${config.type}`);
    }
  }

  /**
   * Execute agents sequentially
   */
  private async executeSequential(
    state: WorkflowExecutionState,
    context: AgentContext,
    options: WorkflowExecutionOptions | undefined,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const { config } = state;
    let currentContext = { ...context };
    const errorRecovery = options?.errorRecovery ?? 'stop';
    const maxRetries = options?.maxRetries ?? 3;

    for (const agentId of config.agents) {
      // Check if cancelled
      if (abortSignal.aborted) {
        this.log('Sequential execution cancelled');
        break;
      }

      // Check stop condition
      if (config.stopWhen && config.stopWhen(state.results)) {
        this.log(`Stop condition met at agent ${agentId}`);
        break;
      }

      // Check max steps
      if (config.maxSteps && state.currentStep >= config.maxSteps) {
        this.log(`Max steps reached: ${config.maxSteps}`);
        break;
      }

      const agent = this.registry.get(agentId);
      if (!agent) {
        const error = `Agent not found: ${agentId}`;
        if (errorRecovery === 'stop') {
          throw new Error(error);
        } else {
          this.log(`Error: ${error}, continuing...`);
          continue;
        }
      }

      this.log(
        `Executing agent: ${agent.name} (step ${state.currentStep + 1})`,
      );

      // Execute with retry logic
      let result: AgentExecutionResult | null = null;
      let lastError: Error | null = null;

      for (
        let attempt = 0;
        attempt <= (errorRecovery === 'retry' ? maxRetries : 0);
        attempt++
      ) {
        if (abortSignal.aborted) {
          break;
        }

        if (attempt > 0) {
          this.log(`Retrying agent ${agent.id}, attempt ${attempt + 1}`);
        }

        try {
          result = await this.executor.execute(agent, currentContext, {
            abortSignal,
            onProgress: (_step, _total) => {
              // Update state and call progress callback
              if (options?.onProgress) {
                options.onProgress(state);
              }
            },
          });

          // Check if execution failed
          if (result.error) {
            throw new Error(result.error);
          }

          // Success, break retry loop
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (errorRecovery === 'stop' || attempt === maxRetries) {
            // Last attempt or stop on error
            result = {
              agentId: agent.id,
              messages: [],
              error: lastError.message,
              metadata: {
                steps: 0,
                executionTime: 0,
                finishReason: 'error',
              },
            };
            break;
          }
        }
      }

      if (result) {
        state.results.push(result);
        state.currentStep++;

        // Call progress callback
        if (options?.onProgress) {
          options.onProgress(state);
        }

        // Handle error based on recovery strategy
        if (result.error) {
          if (errorRecovery === 'stop') {
            throw new Error(`Agent ${agent.id} failed: ${result.error}`);
          } else {
            this.log(
              `Agent ${agent.id} failed: ${result.error}, continuing...`,
            );
          }
        }

        // Pass output to next agent
        if (result.output) {
          currentContext.sharedData = {
            ...currentContext.sharedData,
            previousOutput: result.output,
            previousAgent: agentId,
            previousResult: result,
          };
        }

        // Add generated messages to context for next agent
        if (result.messages.length > 0) {
          currentContext.messages = [
            ...currentContext.messages,
            ...result.messages,
          ];
        }
      }
    }
  }

  /**
   * Execute agents in parallel
   */
  private async executeParallel(
    state: WorkflowExecutionState,
    context: AgentContext,
    options: WorkflowExecutionOptions | undefined,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const { config } = state;

    this.log(`Executing ${config.agents.length} agents in parallel`);

    // Check if cancelled
    if (abortSignal.aborted) {
      this.log('Parallel execution cancelled');
      return;
    }

    // Collect agents
    const agents: AgentDefinition[] = [];
    for (const agentId of config.agents) {
      const agent = this.registry.get(agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }
      agents.push(agent);
    }

    // Execute in parallel
    const results = await this.executor.executeParallel(agents, context, {
      abortSignal,
      maxConcurrency:
        (config.config?.maxConcurrency as number) ?? agents.length,
    });

    state.results = results;
    state.currentStep = config.agents.length;

    // Call progress callback
    if (options?.onProgress) {
      options.onProgress(state);
    }
  }

  /**
   * Execute with routing logic
   */
  private async executeRouting(
    state: WorkflowExecutionState,
    context: AgentContext,
    options: WorkflowExecutionOptions | undefined,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const { config } = state;

    if (config.agents.length < 2) {
      throw new Error(
        'Routing workflow requires at least 2 agents (router + targets)',
      );
    }

    // Use first agent as router
    const routerAgentId = config.agents[0];
    if (!routerAgentId) {
      throw new Error('Router agent ID is undefined');
    }

    const routerAgent = this.registry.get(routerAgentId);
    if (!routerAgent) {
      throw new Error(`Router agent not found: ${routerAgentId}`);
    }

    this.log(`Using router: ${routerAgent.name}`);

    // Execute router to determine which agent to use
    const routerResult = await this.executor.execute(routerAgent, context, {
      abortSignal,
    });

    state.results.push(routerResult);
    state.currentStep++;

    if (options?.onProgress) {
      options.onProgress(state);
    }

    // Extract routing decision from router output
    // In a real implementation, this would parse the router's response
    // For now, we'll use the second agent as default
    let targetAgentId = config.agents[1];
    if (!targetAgentId) {
      throw new Error('Target agent ID is undefined');
    }

    // Try to extract agent selection from output if available
    if (routerResult.output && typeof routerResult.output === 'object') {
      const output = routerResult.output as Record<string, unknown>;
      if (output.selectedAgent && typeof output.selectedAgent === 'string') {
        targetAgentId = output.selectedAgent;
      }
    }

    const targetAgent = this.registry.get(targetAgentId);
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${targetAgentId}`);
    }

    this.log(`Routing to: ${targetAgent.name}`);

    const targetResult = await this.executor.execute(
      targetAgent,
      {
        ...context,
        messages: [...context.messages, ...routerResult.messages],
      },
      {
        abortSignal,
      },
    );

    state.results.push(targetResult);
    state.currentStep++;

    if (options?.onProgress) {
      options.onProgress(state);
    }
  }

  /**
   * Execute evaluator-optimizer loop
   */
  private async executeEvaluatorOptimizer(
    state: WorkflowExecutionState,
    context: AgentContext,
    options: WorkflowExecutionOptions | undefined,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const { config } = state;

    if (config.agents.length < 2) {
      throw new Error(
        'Evaluator-optimizer workflow requires at least 2 agents (generator + evaluator)',
      );
    }

    const generatorAgentId = config.agents[0];
    if (!generatorAgentId) {
      throw new Error('Generator agent ID is undefined');
    }

    const evaluatorAgentId = config.agents[1];
    if (!evaluatorAgentId) {
      throw new Error('Evaluator agent ID is undefined');
    }

    const maxIterations = config.maxSteps || 3;

    let currentContext = { ...context };

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Check if cancelled
      if (abortSignal.aborted) {
        this.log('Evaluator-optimizer execution cancelled');
        break;
      }

      this.log(`Iteration ${iteration + 1}/${maxIterations}`);

      // Generate
      const generatorAgent = this.registry.get(generatorAgentId);
      if (!generatorAgent) {
        throw new Error(`Generator agent not found: ${generatorAgentId}`);
      }

      const generateResult = await this.executor.execute(
        generatorAgent,
        currentContext,
        {
          abortSignal,
        },
      );

      state.results.push(generateResult);
      state.currentStep++;

      if (options?.onProgress) {
        options.onProgress(state);
      }

      // Check for errors
      if (generateResult.error) {
        this.log(`Generator failed: ${generateResult.error}`);
        break;
      }

      // Evaluate
      const evaluatorAgent = this.registry.get(evaluatorAgentId);
      if (!evaluatorAgent) {
        throw new Error(`Evaluator agent not found: ${evaluatorAgentId}`);
      }

      const evaluateContext: AgentContext = {
        ...currentContext,
        messages: [...currentContext.messages, ...generateResult.messages],
        sharedData: {
          ...currentContext.sharedData,
          generatedOutput: generateResult.output,
          iteration: iteration + 1,
        },
      };

      const evaluateResult = await this.executor.execute(
        evaluatorAgent,
        evaluateContext,
        { abortSignal },
      );

      state.results.push(evaluateResult);
      state.currentStep++;

      if (options?.onProgress) {
        options.onProgress(state);
      }

      // Check if evaluation is satisfactory
      if (config.stopWhen && config.stopWhen(state.results)) {
        this.log('Evaluation satisfactory, stopping');
        break;
      }

      // Update context for next iteration with both results
      currentContext.messages = [
        ...currentContext.messages,
        ...generateResult.messages,
        ...evaluateResult.messages,
      ];
      currentContext.sharedData = {
        ...currentContext.sharedData,
        previousEvaluation: evaluateResult.output,
      };
    }
  }

  /**
   * Get active workflows
   * @returns Array of currently running workflows
   */
  getActiveWorkflows(): WorkflowExecutionState[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow state by ID
   * @param workflowId Workflow ID
   * @returns Workflow state or undefined
   */
  getWorkflow(workflowId: string): WorkflowExecutionState | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Cancel a workflow
   * @param workflowId Workflow ID to cancel
   * @returns True if workflow was cancelled, false if not found
   */
  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    // Abort the workflow
    const abortController = this.abortControllers.get(workflowId);
    if (abortController) {
      abortController.abort();
    }

    workflow.status = 'stopped';
    workflow.endTime = new Date();

    this.log(`Cancelled workflow: ${workflowId}`);
    return true;
  }

  /**
   * Cancel all active workflows
   * @returns Number of workflows cancelled
   */
  cancelAllWorkflows(): number {
    const count = this.activeWorkflows.size;

    for (const workflowId of this.activeWorkflows.keys()) {
      this.cancelWorkflow(workflowId);
    }

    this.log(`Cancelled ${count} workflows`);
    return count;
  }

  /**
   * Check if any workflows are active
   * @returns True if workflows are running
   */
  hasActiveWorkflows(): boolean {
    return this.activeWorkflows.size > 0;
  }

  /**
   * Get count of active workflows
   * @returns Number of active workflows
   */
  getActiveCount(): number {
    return this.activeWorkflows.size;
  }

  /**
   * Log message if debug is enabled
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[WorkflowEngine] ${message}`);
    }
  }
}

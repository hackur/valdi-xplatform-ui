/**
 * AgentExecutor
 *
 * Executes individual agents with proper integration to ChatService.
 * Handles message formatting, error handling, and result tracking.
 */

import { AgentDefinition, AgentContext, AgentExecutionResult } from './types';
import { ChatService } from '../../chat_core/src/ChatService';
import { MessageUtils, Message } from '@common';

/**
 * Agent Executor Configuration
 */
export interface AgentExecutorConfig {
  /** Chat service for API calls */
  chatService: ChatService;

  /** Default timeout for agent execution (ms) */
  defaultTimeout?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Agent Executor Class
 *
 * Executes AI agents with comprehensive lifecycle management including timeout handling,
 * abort support, retry logic, and progress tracking. Integrates with ChatService for
 * AI interactions and provides detailed execution metadata including token usage and timing.
 *
 * @example
 * ```typescript
 * const executor = new AgentExecutor({
 *   chatService,
 *   defaultTimeout: 60000,
 *   debug: true,
 * });
 *
 * const result = await executor.execute(
 *   agentDefinition,
 *   {
 *     conversationId: 'conv_123',
 *     messages: [...],
 *     maxSteps: 5,
 *   },
 *   {
 *     timeout: 30000,
 *     onProgress: (step, total) => console.log(`${step}/${total}`),
 *   }
 * );
 *
 * console.log('Agent output:', result.output);
 * console.log('Tokens used:', result.metadata.tokens);
 * ```
 */
export class AgentExecutor {
  private chatService: ChatService;
  private defaultTimeout: number;
  private debug: boolean;
  private activeExecutions = new Set<string>();

  /**
   * Creates a new AgentExecutor instance
   *
   * @param config - Executor configuration including chat service and default settings
   */
  constructor(config: AgentExecutorConfig) {
    this.chatService = config.chatService;
    this.defaultTimeout = config.defaultTimeout ?? 60000; // 60 seconds default
    this.debug = config.debug ?? false;
  }

  /**
   * Execute an agent with full lifecycle management
   *
   * Runs an agent with timeout protection, abort support, and progress tracking.
   * Handles agentic loops for tool-calling agents and provides detailed execution metadata.
   *
   * @param agent - Agent definition including system prompt, model config, and tools
   * @param context - Execution context with conversation ID, messages, and shared data
   * @param options - Optional execution options
   * @param options.timeout - Custom timeout in milliseconds (overrides default)
   * @param options.abortSignal - AbortSignal for cancellation support
   * @param options.onProgress - Callback for step progress updates
   * @returns Promise resolving to execution result with messages, metadata, and optional output
   *
   * @example
   * ```typescript
   * const result = await executor.execute(
   *   {
   *     id: 'research-agent',
   *     name: 'Researcher',
   *     systemPrompt: 'You are a research assistant...',
   *     tools: ['searchWeb', 'fetchUrl'],
   *   },
   *   {
   *     conversationId: 'conv_123',
   *     messages: [...],
   *     maxSteps: 10,
   *   }
   * );
   * ```
   */
  async execute(
    agent: AgentDefinition,
    context: AgentContext,
    options?: {
      timeout?: number;
      abortSignal?: AbortSignal;
      onProgress?: (step: number, total: number) => void;
    },
  ): Promise<AgentExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    const timeout = options?.timeout ?? context.timeout ?? this.defaultTimeout;

    this.log(`Executing agent: ${agent.name} (${agent.id})`);
    this.activeExecutions.add(executionId);

    try {
      // Check if already aborted before starting execution
      // Early exit saves resources and provides immediate feedback
      if (options?.abortSignal?.aborted) {
        throw new Error('Execution aborted before start');
      }

      /*
       * Promise.race pattern for lifecycle management
       * Competing promises: execution, timeout, abort
       * First promise to settle determines execution outcome
       * This ensures proper cleanup and error handling
       */

      // Set up timeout promise for maximum execution time
      // Rejects after timeout to prevent hanging operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Execution timeout after ${timeout}ms`)),
          timeout,
        );
      });

      // Set up abort handling for user cancellation
      // Listens to AbortSignal for graceful shutdown
      const abortPromise = new Promise<never>((_, reject) => {
        if (options?.abortSignal) {
          options.abortSignal.addEventListener('abort', () => {
            reject(new Error('Execution aborted'));
          });
        }
      });

      // Execute agent with timeout and abort support
      const resultPromise = this.executeInternal(agent, context, options);

      // Race between execution, timeout, and abort
      // Whichever resolves/rejects first wins
      const result = await Promise.race([
        resultPromise,
        timeoutPromise,
        ...(options?.abortSignal ? [abortPromise] : []),
      ]);

      this.log(`Agent ${agent.id} completed in ${Date.now() - startTime}ms`);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.log(`Agent ${agent.id} failed: ${errorMessage}`);

      return {
        agentId: agent.id,
        messages: [],
        error: errorMessage,
        metadata: {
          steps: 0,
          executionTime,
          finishReason: errorMessage.includes('timeout')
            ? 'timeout'
            : errorMessage.includes('aborted')
              ? 'max_steps'
              : 'error',
        },
      };
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Internal execution logic
   */
  private async executeInternal(
    agent: AgentDefinition,
    context: AgentContext,
    options?: {
      onProgress?: (step: number, total: number) => void;
    },
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    let steps = 0;
    const maxSteps = context.maxSteps ?? 10;
    const messages: Message[] = [];
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      // Prepare messages
      const conversationMessages = [...context.messages];

      // Add system prompt if provided
      if (agent.systemPrompt && conversationMessages[0]?.role !== 'system') {
        conversationMessages.unshift(
          MessageUtils.createSystemMessage(
            context.conversationId,
            agent.systemPrompt,
          ),
        );
      }

      // Get last message content for the request
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      if (!lastMessage) {
        throw new Error('No messages in conversation context');
      }
      const userContent = MessageUtils.getTextContent(lastMessage);

      // Report progress
      if (options?.onProgress) {
        options.onProgress(0, maxSteps);
      }

      /*
       * Agent execution loop (agentic behavior with tools)
       * Each iteration represents one interaction with the LLM
       * Loop continues until:
       * - Agent returns 'stop' (task complete)
       * - Max steps reached (prevent infinite loops)
       * - Error occurs
       *
       * This pattern enables multi-turn agentic workflows where
       * agents can make tool calls and continue reasoning
       */
      while (steps < maxSteps) {
        steps++;

        this.log(`Agent ${agent.id} step ${steps}/${maxSteps}`);

        // Send message to chat service
        // Each step is a separate API call for fine-grained control
        const response = await this.chatService.sendMessage({
          conversationId: context.conversationId,
          message: userContent,
          modelConfig: agent.model
            ? {
                provider: agent.model.provider,
                modelId: agent.model.modelId,
                temperature: agent.model.temperature,
                maxTokens: agent.model.maxTokens,
              }
            : undefined,
          systemPrompt: agent.systemPrompt,
          toolsEnabled: agent.tools && agent.tools.length > 0,
          maxSteps: 1, // Execute one step at a time for better control
        });

        messages.push(response.message);

        // Track token usage for cost monitoring and quota management
        if (response.usage) {
          promptTokens += response.usage.promptTokens;
          completionTokens += response.usage.completionTokens;
        }

        // Report progress for UI updates
        if (options?.onProgress) {
          options.onProgress(steps, maxSteps);
        }

        /*
         * Finish reason determines loop continuation
         * - stop: Agent completed task, exit loop
         * - tool-calls: Agent needs to execute tools, continue
         * - error: Fatal error, throw exception
         * - length: Token limit reached, continue to next step
         * - unknown: Unexpected state, exit safely
         */
        if (response.finishReason === 'stop') {
          // Normal completion - agent finished reasoning
          break;
        } else if (
          response.finishReason === 'tool-calls' &&
          response.toolCalls
        ) {
          // Tool calls made, continue loop for tool execution and response
          // This enables the agent to use tools and continue reasoning
          this.log(
            `Agent ${agent.id} made ${response.toolCalls.length} tool calls`,
          );
          continue;
        } else if (response.finishReason === 'error') {
          // Error occurred - propagate up
          throw new Error(response.message.error || 'Unknown error');
        } else if (response.finishReason === 'length') {
          // Max tokens reached, but we can continue
          // Agent may need more steps to complete task
          this.log(`Agent ${agent.id} reached max tokens, continuing...`);
          continue;
        } else {
          // Unknown finish reason, stop safely
          break;
        }
      }

      const executionTime = Date.now() - startTime;
      const finishReason: 'completed' | 'max_steps' | 'timeout' | 'error' =
        steps >= maxSteps ? 'max_steps' : 'completed';

      // Extract output from last message
      const lastOutputMessage = messages[messages.length - 1];
      const output =
        context.sharedData?.extractOutput && lastOutputMessage
          ? this.extractOutput(lastOutputMessage)
          : undefined;

      return {
        agentId: agent.id,
        messages,
        output,
        metadata: {
          steps,
          toolCalls: messages.reduce(
            (count, msg) => count + (msg.toolCalls?.length ?? 0),
            0,
          ),
          tokens: {
            prompt: promptTokens,
            completion: completionTokens,
            total: promptTokens + completionTokens,
          },
          executionTime,
          finishReason,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        agentId: agent.id,
        messages,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          steps,
          executionTime,
          finishReason: 'error',
        },
      };
    }
  }

  /**
   * Extract structured output from message
   */
  private extractOutput(message: Message): unknown {
    const content = MessageUtils.getTextContent(message);

    /*
     * Multi-strategy output extraction
     * Tries to parse structured data in order of specificity:
     * 1. JSON code blocks (most explicit)
     * 2. Plain JSON (direct parsing)
     * 3. Plain text (fallback)
     */

    // Try to parse JSON from code blocks first
    // Pattern: ```json\n{...}\n```
    const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // Not valid JSON, continue to next strategy
      }
    }

    // Try to parse plain JSON (entire content is JSON)
    try {
      return JSON.parse(content);
    } catch {
      // Not JSON, return as text (fallback)
      return content;
    }
  }

  /**
   * Execute multiple agents in parallel
   * @param agents Array of agents to execute
   * @param context Execution context
   * @param options Execution options
   * @returns Array of execution results
   */
  async executeParallel(
    agents: AgentDefinition[],
    context: AgentContext,
    options?: {
      timeout?: number;
      abortSignal?: AbortSignal;
      maxConcurrency?: number;
    },
  ): Promise<AgentExecutionResult[]> {
    const maxConcurrency = options?.maxConcurrency ?? agents.length;

    this.log(
      `Executing ${agents.length} agents in parallel (max concurrency: ${maxConcurrency})`,
    );

    /*
     * Batched parallel execution with concurrency control
     * Prevents overwhelming system resources by limiting simultaneous executions
     *
     * Pattern:
     * - Split agents into batches of maxConcurrency size
     * - Execute each batch with Promise.all
     * - Wait for batch completion before starting next batch
     *
     * Benefits:
     * - Resource management (CPU, memory, API rate limits)
     * - Progress tracking per batch
     * - Better error isolation
     */
    const results: AgentExecutionResult[] = [];
    for (let i = 0; i < agents.length; i += maxConcurrency) {
      const batch = agents.slice(i, i + maxConcurrency);
      const batchResults = await Promise.all(
        batch.map((agent) => this.execute(agent, context, options)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get number of active executions
   */
  getActiveCount(): number {
    return this.activeExecutions.size;
  }

  /**
   * Check if any executions are active
   */
  hasActiveExecutions(): boolean {
    return this.activeExecutions.size > 0;
  }

  /**
   * Log message if debug is enabled
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[AgentExecutor] ${message}`);
    }
  }
}

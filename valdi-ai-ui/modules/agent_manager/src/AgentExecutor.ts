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
 * Executes agents and manages their interaction with the chat service.
 * Provides consistent error handling and result formatting.
 */
export class AgentExecutor {
  private chatService: ChatService;
  private defaultTimeout: number;
  private debug: boolean;
  private activeExecutions = new Set<string>();

  constructor(config: AgentExecutorConfig) {
    this.chatService = config.chatService;
    this.defaultTimeout = config.defaultTimeout ?? 60000; // 60 seconds default
    this.debug = config.debug ?? false;
  }

  /**
   * Execute an agent
   * @param agent Agent definition
   * @param context Execution context
   * @param options Execution options
   * @returns Execution result
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
      // Check if already aborted
      if (options?.abortSignal?.aborted) {
        throw new Error('Execution aborted before start');
      }

      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Execution timeout after ${timeout}ms`)),
          timeout,
        );
      });

      // Set up abort handling
      const abortPromise = new Promise<never>((_, reject) => {
        if (options?.abortSignal) {
          options.abortSignal.addEventListener('abort', () => {
            reject(new Error('Execution aborted'));
          });
        }
      });

      // Execute agent with timeout and abort support
      const resultPromise = this.executeInternal(agent, context, options);

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

      // Execute agent loop (for agentic behavior with tools)
      while (steps < maxSteps) {
        steps++;

        this.log(`Agent ${agent.id} step ${steps}/${maxSteps}`);

        // Send message to chat service
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

        // Track token usage
        if (response.usage) {
          promptTokens += response.usage.promptTokens;
          completionTokens += response.usage.completionTokens;
        }

        // Report progress
        if (options?.onProgress) {
          options.onProgress(steps, maxSteps);
        }

        // Check finish reason
        if (response.finishReason === 'stop') {
          // Normal completion
          break;
        } else if (
          response.finishReason === 'tool-calls' &&
          response.toolCalls
        ) {
          // Tool calls made, continue loop
          this.log(
            `Agent ${agent.id} made ${response.toolCalls.length} tool calls`,
          );
          continue;
        } else if (response.finishReason === 'error') {
          // Error occurred
          throw new Error(response.message.error || 'Unknown error');
        } else if (response.finishReason === 'length') {
          // Max tokens reached, but we can continue
          this.log(`Agent ${agent.id} reached max tokens, continuing...`);
          continue;
        } else {
          // Unknown finish reason, stop
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

    // Try to parse JSON from code blocks
    const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // Not valid JSON
      }
    }

    // Try to parse plain JSON
    try {
      return JSON.parse(content);
    } catch {
      // Not JSON, return as text
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

    // Execute in batches if max concurrency is set
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

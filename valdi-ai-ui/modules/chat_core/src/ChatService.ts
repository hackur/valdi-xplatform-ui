/**
 * ChatService
 *
 * Core service for managing AI chat interactions using Vercel AI SDK v5.
 * Handles message sending, streaming, and provider management.
 */

import { streamText, generateText, CoreTool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import {
  Message,
  MessageUtils,
  Conversation,
  AIProvider,
  ModelConfig,
} from '@common';
import { MessageStore } from './MessageStore';
import {
  ChatRequestOptions,
  ChatResponse,
  ChatServiceConfig,
  StreamCallback,
  StreamEvent,
} from './types';
import { ToolExecutor, ToolCallInput, ToolCallResult } from './ToolExecutor';
import { getAllTools } from './ToolDefinitions';

/**
 * ChatService Class
 *
 * Manages AI chat interactions with streaming support
 */
export class ChatService {
  private config: ChatServiceConfig;
  private messageStore: MessageStore;
  private toolExecutor: ToolExecutor;

  constructor(config: ChatServiceConfig, messageStore: MessageStore) {
    this.config = config;
    this.messageStore = messageStore;
    // Initialize with default tools
    this.toolExecutor = new ToolExecutor(getAllTools());
  }

  /**
   * Get AI model instance from configuration
   */
  private getModel(modelConfig: ModelConfig) {
    const { provider, modelId } = modelConfig;

    switch (provider) {
      case 'openai':
        return openai(modelId);
      case 'anthropic':
        return anthropic(modelId);
      case 'google':
        return google(modelId);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Convert conversation messages to AI SDK format
   */
  private convertMessages(messages: Message[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((message) => ({
        role: message.role,
        content: MessageUtils.getTextContent(message),
      }));
  }

  /**
   * Get tools for the current request
   */
  private getTools(options: ChatRequestOptions): Record<string, CoreTool> | undefined {
    if (!options.toolsEnabled) {
      return undefined;
    }

    // If specific tools are provided, use them
    if (options.tools) {
      return options.tools as Record<string, CoreTool>;
    }

    // Otherwise, use all available tools
    return getAllTools();
  }

  /**
   * Send a message and stream the response
   */
  async sendMessageStreaming(
    options: ChatRequestOptions,
    callback: StreamCallback
  ): Promise<Message> {
    const {
      conversationId,
      message: userMessage,
      modelConfig,
      systemPrompt,
      maxSteps = 5,
    } = options;

    // Add user message to store
    const userMsg = MessageUtils.createUserMessage(conversationId, userMessage);
    userMsg.status = 'sending';
    this.messageStore.addMessage(userMsg);

    // Mark user message as completed
    this.messageStore.updateMessage(conversationId, userMsg.id, { status: 'completed' });

    // Create assistant message stub for streaming
    const assistantMsg = MessageUtils.createAssistantMessageStub(conversationId);
    this.messageStore.addMessage(assistantMsg);

    // Set streaming status
    this.messageStore.setStreamingStatus('streaming', assistantMsg.id);

    // Emit start event
    callback({ type: 'start', messageId: assistantMsg.id });

    try {
      // Get conversation messages
      const messages = this.messageStore.getMessages(conversationId);
      const convertedMessages = this.convertMessages(messages.slice(0, -1)); // Exclude the stub

      // Get model
      const model = this.getModel(
        modelConfig || this.config.defaultModelConfig || {
          provider: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        }
      );

      // Get tools if enabled
      const tools = this.getTools(options);

      // Stream the response
      const result = await streamText({
        model,
        messages: convertedMessages,
        system: systemPrompt,
        temperature: modelConfig?.temperature ?? 0.7,
        maxTokens: modelConfig?.maxTokens ?? 4096,
        maxSteps,
        tools,
      });

      // Track tool calls
      const toolCalls: ToolCallResult[] = [];

      // Process stream chunks
      for await (const chunk of result.textStream) {
        // Append to message
        this.messageStore.appendContent(conversationId, assistantMsg.id, chunk);

        // Emit chunk event
        callback({
          type: 'chunk',
          messageId: assistantMsg.id,
          content: this.messageStore.getMessage(conversationId, assistantMsg.id)?.content as string || '',
          delta: chunk,
        });
      }

      // Handle tool calls if any
      if (result.toolCalls && result.toolCalls.length > 0) {
        const toolCallInputs: ToolCallInput[] = result.toolCalls.map((tc) => ({
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args as Record<string, unknown>,
        }));

        // Execute tool calls
        const results = await this.toolExecutor.executeToolCalls(toolCallInputs);
        toolCalls.push(...results);

        // Emit tool call events
        for (const result of results) {
          callback({
            type: 'tool-call',
            messageId: assistantMsg.id,
            toolCall: result,
          });
        }

        // Append tool results to message metadata
        this.messageStore.updateMessage(conversationId, assistantMsg.id, {
          metadata: {
            ...this.messageStore.getMessage(conversationId, assistantMsg.id)?.metadata,
            toolCalls: results.map((r) => ({
              id: r.toolCallId,
              name: r.toolName,
              arguments: toolCallInputs.find((tc) => tc.toolCallId === r.toolCallId)?.args || {},
              result: r.result,
            })),
          },
        });
      }

      // Mark as completed
      this.messageStore.updateMessage(conversationId, assistantMsg.id, {
        status: 'completed',
      });

      this.messageStore.setStreamingStatus('completed');

      // Get final message
      const finalMessage = this.messageStore.getMessage(conversationId, assistantMsg.id);

      if (finalMessage) {
        callback({ type: 'complete', messageId: assistantMsg.id, message: finalMessage });
      }

      return finalMessage!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mark message as error
      this.messageStore.updateMessage(conversationId, assistantMsg.id, {
        status: 'error',
        error: errorMessage,
      });

      this.messageStore.setStreamingStatus('error');

      // Emit error event
      callback({
        type: 'error',
        messageId: assistantMsg.id,
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Send a message and wait for complete response (no streaming)
   */
  async sendMessage(options: ChatRequestOptions): Promise<ChatResponse> {
    const {
      conversationId,
      message: userMessage,
      modelConfig,
      systemPrompt,
      maxSteps = 5,
    } = options;

    // Add user message to store
    const userMsg = MessageUtils.createUserMessage(conversationId, userMessage);
    userMsg.status = 'sending';
    this.messageStore.addMessage(userMsg);

    try {
      // Get conversation messages
      const messages = this.messageStore.getMessages(conversationId);
      const convertedMessages = this.convertMessages(messages);

      // Get model
      const model = this.getModel(
        modelConfig || this.config.defaultModelConfig || {
          provider: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        }
      );

      // Get tools if enabled
      const tools = this.getTools(options);

      // Generate response
      const result = await generateText({
        model,
        messages: convertedMessages,
        system: systemPrompt,
        temperature: modelConfig?.temperature ?? 0.7,
        maxTokens: modelConfig?.maxTokens ?? 4096,
        maxSteps,
        tools,
      });

      // Mark user message as completed
      this.messageStore.updateMessage(conversationId, userMsg.id, { status: 'completed' });

      // Handle tool calls if any
      let toolCallResults: ToolCallResult[] = [];
      if (result.toolCalls && result.toolCalls.length > 0) {
        const toolCallInputs: ToolCallInput[] = result.toolCalls.map((tc) => ({
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args as Record<string, unknown>,
        }));

        // Execute tool calls
        toolCallResults = await this.toolExecutor.executeToolCalls(toolCallInputs);
      }

      // Create assistant message
      const assistantMsg: Message = {
        id: MessageUtils.generateId(),
        conversationId,
        role: 'assistant',
        content: result.text,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
        metadata: {
          tokens: {
            prompt: result.usage?.promptTokens,
            completion: result.usage?.completionTokens,
            total: result.usage?.totalTokens,
          },
          finishReason: result.finishReason,
          ...(toolCallResults.length > 0 && {
            toolCalls: toolCallResults.map((r, idx) => ({
              id: r.toolCallId,
              name: r.toolName,
              arguments: result.toolCalls?.[idx]?.args || {},
              result: r.result,
            })),
          }),
        },
      };

      this.messageStore.addMessage(assistantMsg);

      return {
        message: assistantMsg,
        toolCalls: toolCallResults.length > 0 ? toolCallResults.map((r, idx) => ({
          id: r.toolCallId,
          name: r.toolName,
          arguments: result.toolCalls?.[idx]?.args as Record<string, unknown> || {},
          result: r.result,
        })) : undefined,
        finishReason: result.finishReason,
        usage: {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mark user message as error
      this.messageStore.updateMessage(conversationId, userMsg.id, {
        status: 'error',
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Cancel ongoing stream
   */
  cancelStream(): void {
    if (this.messageStore.isStreaming()) {
      this.messageStore.setStreamingStatus('idle');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get the tool executor instance
   */
  getToolExecutor(): ToolExecutor {
    return this.toolExecutor;
  }

  /**
   * Update available tools
   */
  updateTools(tools: Record<string, CoreTool>): void {
    this.toolExecutor.updateTools(tools);
  }

  /**
   * Add a tool to the executor
   */
  addTool(name: string, tool: CoreTool): void {
    this.toolExecutor.addTool(name, tool);
  }

  /**
   * Remove a tool from the executor
   */
  removeTool(name: string): void {
    this.toolExecutor.removeTool(name);
  }

  /**
   * Get available tool names
   */
  getAvailableToolNames(): string[] {
    return this.toolExecutor.getAvailableToolNames();
  }
}

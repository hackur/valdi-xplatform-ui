/**
 * ChatService
 *
 * Core service for managing AI chat interactions using native HTTP requests.
 * Uses Valdi's valdi_http module for cross-platform networking.
 */

// @ts-ignore - valdi_http is a vendor library without TypeScript definitions
import { HTTPClient } from 'valdi_http/src/HTTPClient';
import { Message, MessageUtils, AIProvider, ModelConfig } from '@common/types';
import {
  APIError,
  ErrorCode,
  handleError,
  retryWithBackoff,
} from '@common/errors';
import { MessageStore } from './MessageStore';
import {
  ChatRequestOptions,
  ChatResponse,
  ChatServiceConfig,
  StreamCallback,
} from './types';

/**
 * API Endpoints for each provider
 */
const PROVIDER_ENDPOINTS = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
} as const;

/**
 * ChatService Class
 *
 * Manages AI chat interactions using native HTTP requests
 * Note: Streaming is simulated as Valdi doesn't have native SSE support yet
 */
export class ChatService {
  private config: ChatServiceConfig;
  private messageStore: MessageStore;
  private httpClients: Record<string, HTTPClient>;

  constructor(config: ChatServiceConfig, messageStore: MessageStore) {
    this.config = config;
    this.messageStore = messageStore;

    // Initialize HTTP clients for each provider
    this.httpClients = {
      openai: new HTTPClient(PROVIDER_ENDPOINTS.openai),
      anthropic: new HTTPClient(PROVIDER_ENDPOINTS.anthropic),
      google: new HTTPClient(PROVIDER_ENDPOINTS.google),
    };
  }

  /**
   * Map HTTP status code to error code
   */
  private getErrorCodeFromStatus(statusCode: number): ErrorCode {
    switch (statusCode) {
      case 401:
        return ErrorCode.API_AUTHENTICATION;
      case 403:
        return ErrorCode.API_AUTHORIZATION;
      case 404:
        return ErrorCode.API_NOT_FOUND;
      case 408:
        return ErrorCode.API_TIMEOUT;
      case 429:
        return ErrorCode.API_RATE_LIMIT;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorCode.API_SERVER_ERROR;
      default:
        return ErrorCode.API_INVALID_REQUEST;
    }
  }

  /**
   * Convert conversation messages to provider-specific format
   */
  private convertMessages(messages: Message[], provider: AIProvider) {
    const converted = messages
      .filter((m) => m.role !== 'system')
      .map((message) => ({
        role: message.role,
        content: MessageUtils.getTextContent(message),
      }));

    // Anthropic uses different role names
    if (provider === 'anthropic') {
      return converted.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));
    }

    return converted;
  }

  /**
   * Get system prompt from messages or options
   */
  private getSystemPrompt(
    messages: Message[],
    options: ChatRequestOptions,
  ): string | undefined {
    if (options.systemPrompt) {
      return options.systemPrompt;
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    return systemMessage
      ? MessageUtils.getTextContent(systemMessage)
      : undefined;
  }

  /**
   * Send message to OpenAI
   */
  private async sendToOpenAI(
    messages: Message[],
    modelConfig: ModelConfig,
    systemPrompt?: string,
  ): Promise<string> {
    const apiKey = this.config.apiKeys.openai;
    if (!apiKey) {
      throw new APIError(
        'OpenAI API key not configured',
        ErrorCode.API_AUTHENTICATION,
        {
          provider: 'openai',
          userMessage: 'Please add your OpenAI API key in Settings',
        },
      );
    }

    const requestBody = JSON.stringify({
      model: modelConfig.modelId,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...this.convertMessages(messages, 'openai'),
      ],
      temperature: modelConfig.temperature ?? 1.0,
      max_tokens: modelConfig.maxTokens ?? 2000,
    });

    const encodedBody = new TextEncoder().encode(requestBody);

    return retryWithBackoff(
      async () => {
        try {
          const response = await this.httpClients.openai.post(
            '/chat/completions',
            encodedBody,
            {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          );

          if (!response.body) {
            throw new APIError(
              'Empty response from OpenAI',
              ErrorCode.API_INVALID_RESPONSE,
              {
                provider: 'openai',
                url: '/chat/completions',
              },
            );
          }

          const text = new TextDecoder().decode(response.body);
          const result = JSON.parse(text);

          if (result.error) {
            const statusCode = response.status || 500;
            const errorCode = this.getErrorCodeFromStatus(statusCode);
            throw new APIError(
              result.error.message || 'OpenAI API error',
              errorCode,
              {
                statusCode,
                provider: 'openai',
                url: '/chat/completions',
              },
            );
          }

          return result.choices?.[0]?.message?.content || '';
        } catch (error: any) {
          if (error instanceof APIError) {
            throw error;
          }
          throw new APIError(
            `OpenAI request failed: ${error.toString()}`,
            ErrorCode.API_NETWORK_ERROR,
            {
              provider: 'openai',
              cause: error,
            },
          );
        }
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt, delay) => {
          console.log(
            `[ChatService] Retrying OpenAI request (attempt ${attempt}) after ${delay}ms`,
            error,
          );
        },
      },
    );
  }

  /**
   * Send message to Anthropic
   */
  private async sendToAnthropic(
    messages: Message[],
    modelConfig: ModelConfig,
    systemPrompt?: string,
  ): Promise<string> {
    const apiKey = this.config.apiKeys.anthropic;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const requestBody = JSON.stringify({
      model: modelConfig.modelId,
      max_tokens: modelConfig.maxTokens ?? 2000,
      messages: this.convertMessages(messages, 'anthropic'),
      ...(systemPrompt ? { system: systemPrompt } : {}),
      temperature: modelConfig.temperature ?? 1.0,
    });

    const encodedBody = new TextEncoder().encode(requestBody);

    try {
      const response = await this.httpClients.anthropic.post(
        '/messages',
        encodedBody,
        {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      );

      if (!response.body) {
        throw new Error('Empty response from Anthropic');
      }

      const text = new TextDecoder().decode(response.body);
      const result = JSON.parse(text);

      if (result.error) {
        throw new Error(result.error.message || 'Anthropic API error');
      }

      return result.content?.[0]?.text || '';
    } catch (error: any) {
      throw new Error(`Anthropic request failed: ${error.toString()}`);
    }
  }

  /**
   * Send message to Google
   */
  private async sendToGoogle(
    messages: Message[],
    modelConfig: ModelConfig,
    systemPrompt?: string,
  ): Promise<string> {
    const apiKey = this.config.apiKeys.google;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    // Google's Gemini API format
    const contents = this.convertMessages(messages, 'google').map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const requestBody = JSON.stringify({
      contents,
      generationConfig: {
        temperature: modelConfig.temperature ?? 1.0,
        maxOutputTokens: modelConfig.maxTokens ?? 2000,
      },
      ...(systemPrompt
        ? {
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
          }
        : {}),
    });

    const encodedBody = new TextEncoder().encode(requestBody);
    const endpoint = `/models/${modelConfig.modelId}:generateContent?key=${apiKey}`;

    try {
      const response = await this.httpClients.google.post(
        endpoint,
        encodedBody,
        {
          'Content-Type': 'application/json',
        },
      );

      if (!response.body) {
        throw new Error('Empty response from Google');
      }

      const text = new TextDecoder().decode(response.body);
      const result = JSON.parse(text);

      if (result.error) {
        throw new Error(result.error.message || 'Google API error');
      }

      return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error: any) {
      throw new Error(`Google request failed: ${error.toString()}`);
    }
  }

  /**
   * Send a message (non-streaming)
   */
  async sendMessage(options: ChatRequestOptions): Promise<ChatResponse> {
    const {
      conversationId,
      message: userMessage,
      modelConfig: overrideConfig,
    } = options;

    // Get messages from conversation
    const messages = this.messageStore.getMessages(conversationId);

    // Use provided config or default
    const modelConfig = overrideConfig
      ? { ...this.config.defaultModelConfig, ...overrideConfig }
      : this.config.defaultModelConfig;

    if (!modelConfig) {
      throw new Error('Model configuration not provided');
    }

    // Get system prompt
    const systemPrompt = this.getSystemPrompt(messages, options);

    // Add user message
    const userMsg = MessageUtils.createUserMessage(conversationId, userMessage);
    await this.messageStore.addMessage(userMsg);

    // Send to appropriate provider
    let responseText: string;
    const provider = modelConfig.provider as AIProvider;

    try {
      switch (provider) {
        case 'openai':
          responseText = await this.sendToOpenAI(
            [...messages, userMsg],
            modelConfig as ModelConfig,
            systemPrompt,
          );
          break;
        case 'anthropic':
          responseText = await this.sendToAnthropic(
            [...messages, userMsg],
            modelConfig as ModelConfig,
            systemPrompt,
          );
          break;
        case 'google':
          responseText = await this.sendToGoogle(
            [...messages, userMsg],
            modelConfig as ModelConfig,
            systemPrompt,
          );
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Create assistant message
      const now = new Date();
      const assistantMsg: Message = {
        id: MessageUtils.generateId(),
        conversationId,
        role: 'assistant',
        content: responseText,
        createdAt: now,
        updatedAt: now,
        status: 'completed',
      };
      await this.messageStore.addMessage(assistantMsg);

      return {
        message: assistantMsg,
        finishReason: 'stop',
      };
    } catch (error: any) {
      // Handle and format error
      const errorInfo = handleError(error, {
        conversationId,
        provider,
        operation: 'sendMessage',
      });

      // Create error message
      const now = new Date();
      const errorMsg: Message = {
        id: MessageUtils.generateId(),
        conversationId,
        role: 'assistant',
        content: `Error: ${errorInfo.userMessage}`,
        createdAt: now,
        updatedAt: now,
        status: 'error',
        error: errorInfo.message,
      };
      await this.messageStore.addMessage(errorMsg);

      return {
        message: errorMsg,
        finishReason: 'error',
      };
    }
  }

  /**
   * Send message with simulated streaming
   * Note: Valdi doesn't have native SSE support, so we simulate streaming
   * by sending the complete response in chunks
   */
  async sendMessageStreaming(
    options: ChatRequestOptions,
    callback: StreamCallback,
  ): Promise<Message> {
    // For now, get the complete response and simulate streaming
    const messageId = `msg-${Date.now()}`;

    callback({ type: 'start', messageId });

    try {
      const response = await this.sendMessage(options);

      const content = MessageUtils.getTextContent(response.message);

      // Simulate streaming by sending chunks
      const chunkSize = 10;
      let accumulated = '';

      for (let i = 0; i < content.length; i += chunkSize) {
        const delta = content.slice(i, i + chunkSize);
        accumulated += delta;

        callback({
          type: 'chunk',
          messageId,
          content: accumulated,
          delta,
        });

        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      callback({ type: 'complete', messageId, message: response.message });

      return response.message;
    } catch (error: any) {
      callback({
        type: 'error',
        messageId,
        error: error.message || error.toString(),
      });
      throw error;
    }
  }
}

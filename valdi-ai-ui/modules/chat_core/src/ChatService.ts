/**
 * ChatService
 *
 * Core service for managing AI chat interactions using native HTTP requests.
 * Uses Valdi's valdi_http module for cross-platform networking.
 */

// @ts-ignore - valdi_http is a vendor library without TypeScript definitions
import { HTTPClient } from 'valdi_http/src/HTTPClient';
import type {
  Message,
  AIProvider,
  ModelConfig} from '../../common/src';
import {
  MessageUtils
} from '../../common/src';
import {
  APIError,
  ErrorCode,
  handleError,
  retryWithBackoff,
  Logger,
} from '../../common/src';
import type { MessageStore } from './MessageStore';
import type {
  ChatRequestOptions,
  ChatResponse,
  ChatServiceConfig,
  StreamCallback,
} from './types';
import type { ModelRegistry } from '../../model_config/src/ModelRegistry';

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
 * Manages AI chat interactions using native HTTP requests across multiple AI providers.
 * Handles message formatting, API communication, error handling, and retry logic.
 * Supports OpenAI, Anthropic, and Google AI providers with automatic retries and backoff.
 *
 * @example
 * ```typescript
 * const chatService = new ChatService(
 *   {
 *     apiKeys: {
 *       openai: 'sk-...',
 *       anthropic: 'sk-ant-...',
 *     },
 *     defaultModelConfig: {
 *       provider: 'openai',
 *       modelId: 'gpt-4',
 *       temperature: 0.7,
 *       maxTokens: 2000,
 *     },
 *   },
 *   messageStore
 * );
 *
 * const response = await chatService.sendMessage({
 *   conversationId: 'conv_123',
 *   message: 'Hello, how are you?',
 * });
 * ```
 *
 * Note: Streaming is simulated as Valdi doesn't have native SSE support yet
 */
export class ChatService {
  private readonly config: ChatServiceConfig;
  private readonly messageStore: MessageStore;
  private readonly httpClients: Record<string, HTTPClient>;
  private readonly customClients: Map<string, HTTPClient> = new Map();
  private readonly modelRegistry?: ModelRegistry;
  private readonly logger: Logger;

  /**
   * Creates a new ChatService instance
   *
   * @param config - Service configuration including API keys and default model settings
   * @param messageStore - Message store for managing conversation messages
   * @param modelRegistry - Optional model registry for custom provider lookup
   */
  constructor(
    config: ChatServiceConfig,
    messageStore: MessageStore,
    modelRegistry?: ModelRegistry
  ) {
    this.config = config;
    this.messageStore = messageStore;
    this.modelRegistry = modelRegistry;
    this.logger = new Logger({ module: 'ChatService' });

    // Initialize HTTP clients for each provider
    this.httpClients = {
      openai: new HTTPClient(PROVIDER_ENDPOINTS.openai),
      anthropic: new HTTPClient(PROVIDER_ENDPOINTS.anthropic),
      google: new HTTPClient(PROVIDER_ENDPOINTS.google),
    };
  }

  /**
   * Map HTTP status code to standardized error code
   *
   * Converts HTTP status codes to application-specific error codes
   * for consistent error handling across the application.
   *
   * @param statusCode - HTTP status code from API response
   * @returns Corresponding ErrorCode enum value
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
   *
   * Transforms generic Message objects into the format expected by each AI provider.
   * Filters out system messages (handled separately) and adapts role names for provider compatibility.
   *
   * @param messages - Array of conversation messages to convert
   * @param provider - Target AI provider ('openai' | 'anthropic' | 'google')
   * @returns Array of messages in provider-specific format
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
   *
   * Extracts the system prompt from either the request options or conversation messages.
   * Prioritizes the system prompt from options if provided.
   *
   * @param messages - Array of conversation messages
   * @param options - Chat request options that may contain a system prompt
   * @returns System prompt string or undefined if none found
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
   * Get or create HTTP client for custom provider
   *
   * Creates and caches HTTP clients for custom provider base URLs.
   *
   * @param baseUrl - The base URL for the custom provider
   * @returns HTTPClient instance for the provider
   */
  private getClientForProvider(baseUrl: string): HTTPClient {
    const normalizedUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    if (!this.customClients.has(normalizedUrl)) {
      this.customClients.set(normalizedUrl, new HTTPClient(normalizedUrl));
    }
    return this.customClients.get(normalizedUrl)!;
  }

  /**
   * Send message to custom OpenAI-compatible API
   *
   * Handles communication with custom OpenAI-compatible endpoints (LM Studio, Ollama, etc.)
   * using the provider configuration from ModelRegistry.
   *
   * @param messages - Conversation messages to send
   * @param modelConfig - Model configuration with customProviderId
   * @param systemPrompt - Optional system prompt for the request
   * @returns The AI's text response
   * @throws {APIError} When provider not found, configuration invalid, or request fails
   */
  private async sendToCustomOpenAI(
    messages: Message[],
    modelConfig: ModelConfig & { customProviderId: string },
    systemPrompt?: string,
  ): Promise<string> {
    if (!this.modelRegistry) {
      throw new APIError(
        'ModelRegistry not configured. Cannot use custom providers.',
        ErrorCode.API_INVALID_REQUEST,
        {
          context: {
            customProviderId: modelConfig.customProviderId,
          },
          userMessage: 'Custom providers require ModelRegistry configuration',
        },
      );
    }

    const provider = this.modelRegistry.getProvider(
      'custom-openai-compatible',
      modelConfig.customProviderId
    );

    if (provider?.type !== 'custom-openai-compatible') {
      throw new APIError(
        'Custom provider not found',
        ErrorCode.API_INVALID_REQUEST,
        {
          context: {
            customProviderId: modelConfig.customProviderId,
          },
          userMessage: 'The selected custom provider is not available. Please check Settings.',
        },
      );
    }

    const customProvider = provider;
    const client = this.getClientForProvider(customProvider.baseUrl);

    const requestBody = JSON.stringify({
      model: customProvider.modelId,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...this.convertMessages(messages, 'openai'), // Use OpenAI format
      ],
      temperature: modelConfig.temperature ?? customProvider.defaultTemperature ?? 0.7,
      max_tokens: modelConfig.maxTokens ?? customProvider.maxOutputTokens ?? 2000,
    });

    const encodedBody = new TextEncoder().encode(requestBody);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customProvider.headers || {}),
    };

    if (customProvider.apiKey) {
      headers.Authorization = `Bearer ${customProvider.apiKey}`;
    }

    return retryWithBackoff(
      async () => {
        try {
          const response = await client.post('/chat/completions', encodedBody, headers);

          if (!response.body) {
            throw new APIError(
              'Empty response from custom provider',
              ErrorCode.API_INVALID_RESPONSE,
              {
                provider: customProvider.name,
                context: {
                  baseUrl: customProvider.baseUrl,
                },
              },
            );
          }

          const text = new TextDecoder().decode(response.body);
          const result = JSON.parse(text);

          if (result.error) {
            const statusCode = (response as any).status || 500;
            const errorCode = this.getErrorCodeFromStatus(statusCode);
            throw new APIError(
              result.error.message || 'Custom provider API error',
              errorCode,
              {
                statusCode,
                provider: customProvider.name,
                context: {
                  baseUrl: customProvider.baseUrl,
                },
              },
            );
          }

          return result.choices?.[0]?.message?.content || '';
        } catch (error: any) {
          if (error instanceof APIError) {
            throw error;
          }
          throw new APIError(
            `Custom provider request failed: ${error.toString()}`,
            ErrorCode.API_NETWORK_ERROR,
            {
              provider: customProvider.name,
              context: {
                baseUrl: customProvider.baseUrl,
              },
              cause: error,
              userMessage: `Failed to connect to ${customProvider.name}. Check that the server is running.`,
            },
          );
        }
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(
            `Retrying custom provider request (attempt ${attempt}) after ${delay}ms`,
            error,
          );
        },
      },
    );
  }

  /**
   * Send message to OpenAI API
   *
   * Handles communication with OpenAI's chat completions endpoint with automatic
   * retry logic and comprehensive error handling.
   *
   * @param messages - Conversation messages to send
   * @param modelConfig - Model configuration (model ID, temperature, etc.)
   * @param systemPrompt - Optional system prompt for the request
   * @returns The AI's text response
   * @throws {APIError} When API key is missing, request fails, or response is invalid
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
            const statusCode = (response as any).status || 500;
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
          this.logger.warn(
            `Retrying OpenAI request (attempt ${attempt}) after ${delay}ms`,
            error,
          );
        },
      },
    );
  }

  /**
   * Send message to Anthropic API
   *
   * Handles communication with Anthropic's messages endpoint using their specific
   * API format and requirements.
   *
   * @param messages - Conversation messages to send
   * @param modelConfig - Model configuration (model ID, temperature, etc.)
   * @param systemPrompt - Optional system prompt for the request
   * @returns The AI's text response
   * @throws {Error} When API key is missing, request fails, or response is invalid
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
   * Send message to Google Gemini API
   *
   * Handles communication with Google's Generative Language API using the
   * Gemini model format with system instructions support.
   *
   * @param messages - Conversation messages to send
   * @param modelConfig - Model configuration (model ID, temperature, etc.)
   * @param systemPrompt - Optional system instruction for the request
   * @returns The AI's text response
   * @throws {Error} When API key is missing, request fails, or response is invalid
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
   * Send a message to the AI model (non-streaming)
   *
   * Main method for sending chat messages. Handles message storage, provider routing,
   * error handling, and response formatting. Automatically stores both user and
   * assistant messages in the message store.
   *
   * @example
   * ```typescript
   * const response = await chatService.sendMessage({
   *   conversationId: 'conv_123',
   *   message: 'What is the capital of France?',
   *   modelConfig: {
   *     provider: 'openai',
   *     modelId: 'gpt-4',
   *     temperature: 0.7,
   *   },
   * });
   *
   * console.log(response.message.content); // "The capital of France is Paris."
   * ```
   *
   * @param options - Chat request options including conversation ID, message, and model config
   * @returns Promise resolving to chat response with message and finish reason
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
        case 'custom-openai-compatible':
          if (!modelConfig.customProviderId) {
            throw new APIError(
              'Custom provider ID required for custom-openai-compatible provider',
              ErrorCode.API_INVALID_REQUEST,
              {
                provider,
                userMessage: 'Invalid custom provider configuration. Please reconfigure in Settings.',
              },
            );
          }
          responseText = await this.sendToCustomOpenAI(
            [...messages, userMsg],
            modelConfig as ModelConfig & { customProviderId: string },
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
   *
   * Provides a streaming-like experience by chunking the complete response.
   * Calls the callback with stream events (start, chunk, complete, error) to
   * enable progressive UI updates.
   *
   * @example
   * ```typescript
   * const message = await chatService.sendMessageStreaming(
   *   {
   *     conversationId: 'conv_123',
   *     message: 'Tell me a story',
   *   },
   *   (event) => {
   *     switch (event.type) {
   *       case 'start':
   *         console.log('Streaming started');
   *         break;
   *       case 'chunk':
   *         console.log('Received chunk:', event.delta);
   *         break;
   *       case 'complete':
   *         console.log('Streaming complete');
   *         break;
   *     }
   *   }
   * );
   * ```
   *
   * Note: Valdi doesn't have native SSE support, so we simulate streaming
   * by sending the complete response in chunks with artificial delays.
   *
   * @param options - Chat request options
   * @param callback - Callback function for stream events
   * @returns Promise resolving to the final message
   * @throws When the underlying sendMessage call fails
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

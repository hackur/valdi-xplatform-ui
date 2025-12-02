/**
 * ChatService Unit Tests
 *
 * Tests for ChatService message sending, streaming, and error handling.
 */

import { ChatService } from '../ChatService';
import { MessageStore } from '../MessageStore';
import { Message, MessageUtils, APIError, ErrorCode } from '../../../common/src/index';
import { HTTPClient } from 'valdi_http/src/HTTPClient';

// Mock HTTPClient
jest.mock('valdi_http/src/HTTPClient');

// Mock MessageStore
jest.mock('../MessageStore');

describe('ChatService', () => {
  let chatService: ChatService;
  let mockMessageStore: jest.Mocked<MessageStore>;
  let mockHTTPClient: jest.Mocked<HTTPClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock MessageStore
    mockMessageStore = {
      getMessages: jest.fn().mockReturnValue([]),
      addMessage: jest.fn().mockResolvedValue(undefined),
      getMessage: jest.fn(),
      updateMessage: jest.fn().mockResolvedValue(undefined),
      deleteMessage: jest.fn().mockResolvedValue(undefined),
      clearConversation: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn(),
      getState: jest.fn(),
      setStreamingStatus: jest.fn(),
      getStreamingStatus: jest.fn().mockReturnValue('idle'),
      isStreaming: jest.fn().mockReturnValue(false),
      getLastMessage: jest.fn(),
      getMessageCount: jest.fn().mockReturnValue(0),
      reset: jest.fn().mockResolvedValue(undefined),
      appendContent: jest.fn(),
      init: jest.fn().mockResolvedValue(undefined),
      setPersistence: jest.fn(),
      isPersistenceEnabled: jest.fn().mockReturnValue(true),
      flushPersistence: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock HTTPClient
    mockHTTPClient = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    // Mock HTTPClient constructor
    (HTTPClient as jest.MockedClass<typeof HTTPClient>).mockImplementation(
      () => mockHTTPClient,
    );

    // Create ChatService
    chatService = new ChatService(
      {
        apiKeys: {
          openai: 'test-openai-key',
          anthropic: 'test-anthropic-key',
          google: 'test-google-key',
        },
        defaultModelConfig: {
          provider: 'openai',
          modelId: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        },
      },
      mockMessageStore,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Message sending', () => {
    it('should send message successfully', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const userMessage = 'Hello, AI!';

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: 'Hello! How can I help you?',
                },
              },
            ],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: userMessage,
      });

      // Assert
      expect(response.message.content).toBe('Hello! How can I help you?');
      expect(response.message.role).toBe('assistant');
      expect(response.finishReason).toBe('stop');
      expect(mockMessageStore.addMessage).toHaveBeenCalledTimes(2); // User + assistant
    });

    it('should use custom model config', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'Response' } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
        modelConfig: {
          provider: 'anthropic',
          modelId: 'claude-3',
          temperature: 0.5,
        },
      });

      // Assert
      expect(mockHTTPClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Uint8Array),
        expect.objectContaining({
          'x-api-key': 'test-anthropic-key',
        }),
      );
    });

    it('should include system prompt', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const systemPrompt = 'You are a helpful assistant.';

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'Response' } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
        systemPrompt,
      });

      // Assert
      const callArgs = mockHTTPClient.post.mock.calls[0];
      const requestBody = JSON.parse(
        new TextDecoder().decode(callArgs?.[1] as Uint8Array),
      );
      expect(requestBody.messages[0]).toEqual({
        role: 'system',
        content: systemPrompt,
      });
    });

    it('should handle existing conversation messages', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const existingMessages: Message[] = [
        {
          id: 'msg-1',
          conversationId,
          role: 'user',
          content: 'Previous message',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
        {
          id: 'msg-2',
          conversationId,
          role: 'assistant',
          content: 'Previous response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed',
        },
      ];

      mockMessageStore.getMessages.mockReturnValue(existingMessages);

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'New response' } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'New message',
      });

      // Assert
      const callArgs = mockHTTPClient.post.mock.calls[0];
      const requestBody = JSON.parse(
        new TextDecoder().decode(callArgs?.[1] as Uint8Array),
      );
      expect(requestBody.messages.length).toBeGreaterThan(2);
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // Arrange
      const conversationId = 'conv-123';
      mockHTTPClient.post.mockRejectedValue(new Error('Network error'));

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('error');
      expect(response.message.status).toBe('error');
      expect(response.message.content).toContain('Error');
    });

    it('should handle API authentication errors', async () => {
      // Arrange
      const chatServiceNoKey = new ChatService(
        {
          apiKeys: {
            openai: undefined,
            anthropic: undefined,
            google: undefined,
          },
          defaultModelConfig: {
            provider: 'openai',
            modelId: 'gpt-4',
          },
        },
        mockMessageStore,
      );

      // Act
      const response = await chatServiceNoKey.sendMessage({
        conversationId: 'conv-123',
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('error');
      expect(response.message.content).toContain('API key');
    });

    it('should handle API error responses', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockErrorResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            error: {
              message: 'Rate limit exceeded',
            },
          }),
        ),
        status: 429,
      };

      mockHTTPClient.post.mockResolvedValue(mockErrorResponse);

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('error');
      expect(response.message.status).toBe('error');
    });

    it('should handle empty API responses', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockEmptyResponse = {
        body: null,
      };

      mockHTTPClient.post.mockResolvedValue(mockEmptyResponse);

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('error');
    });

    it('should handle malformed JSON responses', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockMalformedResponse = {
        body: new TextEncoder().encode('Not valid JSON'),
      };

      mockHTTPClient.post.mockResolvedValue(mockMalformedResponse);

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('error');
    });
  });

  describe('Provider-specific handling', () => {
    it('should handle OpenAI provider', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'OpenAI response' } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
        modelConfig: {
          provider: 'openai',
          modelId: 'gpt-4',
        },
      });

      // Assert
      expect(mockHTTPClient.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.any(Uint8Array),
        expect.objectContaining({
          Authorization: 'Bearer test-openai-key',
        }),
      );
    });

    it('should handle Anthropic provider', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: 'Anthropic response' }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
        modelConfig: {
          provider: 'anthropic',
          modelId: 'claude-3',
        },
      });

      // Assert
      expect(mockHTTPClient.post).toHaveBeenCalledWith(
        '/messages',
        expect.any(Uint8Array),
        expect.objectContaining({
          'x-api-key': 'test-anthropic-key',
          'anthropic-version': '2023-06-01',
        }),
      );
    });

    it('should handle Google provider', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Google response' }],
                },
              },
            ],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
        modelConfig: {
          provider: 'google',
          modelId: 'gemini-pro',
        },
      });

      // Assert
      expect(mockHTTPClient.post).toHaveBeenCalledWith(
        expect.stringContaining('gemini-pro'),
        expect.any(Uint8Array),
        expect.any(Object),
      );
    });
  });

  describe('Streaming support', () => {
    it('should handle streaming response', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'Streaming response' } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      const streamCallback = jest.fn();

      // Act
      await chatService.sendMessageStreaming(
        {
          conversationId,
          message: 'Test',
        },
        streamCallback,
      );

      // Assert
      expect(streamCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'start' }),
      );
      expect(streamCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chunk' }),
      );
      expect(streamCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'complete' }),
      );
    });

    it('should handle streaming errors', async () => {
      // Arrange
      const conversationId = 'conv-123';
      mockHTTPClient.post.mockRejectedValue(new Error('Stream error'));

      const streamCallback = jest.fn();

      // Act
      const result = await chatService.sendMessageStreaming(
        {
          conversationId,
          message: 'Test',
        },
        streamCallback,
      );

      // Assert
      expect(result.status).toBe('error');
      // When sendMessage fails, it returns an error message (not throw),
      // so streaming will complete normally with error message content
      expect(streamCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'start' }),
      );
    });
  });

  describe('Retry logic', () => {
    it('should retry failed requests', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const mockSuccessResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'Success after retry' } }],
          }),
        ),
      };

      // First call fails, second succeeds
      mockHTTPClient.post
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(mockSuccessResponse);

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('stop');
      expect(response.message.content).toBe('Success after retry');
      expect(mockHTTPClient.post).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries', async () => {
      // Arrange
      const conversationId = 'conv-123';
      mockHTTPClient.post.mockRejectedValue(new Error('Persistent failure'));

      // Act
      const response = await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(response.finishReason).toBe('error');
      expect(mockHTTPClient.post).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('Message store integration', () => {
    it('should add user message to store', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const userMessage = 'Test message';

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: 'Response' } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: userMessage,
      });

      // Assert
      expect(mockMessageStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId,
          role: 'user',
          content: userMessage,
        }),
      );
    });

    it('should add assistant message to store', async () => {
      // Arrange
      const conversationId = 'conv-123';
      const assistantResponse = 'AI response';

      const mockResponse = {
        body: new TextEncoder().encode(
          JSON.stringify({
            choices: [{ message: { content: assistantResponse } }],
          }),
        ),
      };

      mockHTTPClient.post.mockResolvedValue(mockResponse);

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(mockMessageStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId,
          role: 'assistant',
          content: assistantResponse,
          status: 'completed',
        }),
      );
    });

    it('should add error message to store on failure', async () => {
      // Arrange
      const conversationId = 'conv-123';
      mockHTTPClient.post.mockRejectedValue(new Error('API error'));

      // Act
      await chatService.sendMessage({
        conversationId,
        message: 'Test',
      });

      // Assert
      expect(mockMessageStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId,
          role: 'assistant',
          status: 'error',
        }),
      );
    });
  });
});

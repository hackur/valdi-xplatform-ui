/**
 * AgentExecutor Unit Tests
 *
 * Tests for AgentExecutor workflow execution and error handling.
 */

import { AgentExecutor } from '../AgentExecutor';
import { ChatService } from '../../../chat_core/src/ChatService';
import { AgentDefinition, AgentContext } from '../types';
import { MessageUtils } from 'common/src';

// Mock ChatService
jest.mock('../../../chat_core/src/ChatService');

describe('AgentExecutor', () => {
  let agentExecutor: AgentExecutor;
  let mockChatService: jest.Mocked<ChatService>;

  const mockAgent: AgentDefinition = {
    id: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent',
    systemPrompt: 'You are a helpful assistant.',
    model: {
      provider: 'openai',
      modelId: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
    },
    tools: [],
    capabilities: ['chat'],
  };

  const mockContext: AgentContext = {
    conversationId: 'conv-123',
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-123',
        role: 'user',
        content: 'Hello',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      },
    ],
    maxSteps: 5,
    timeout: 30000,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ChatService
    mockChatService = {
      sendMessage: jest.fn(),
      sendMessageStreaming: jest.fn(),
    } as any;

    agentExecutor = new AgentExecutor({
      chatService: mockChatService,
      defaultTimeout: 60000,
      debug: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Workflow execution', () => {
    it('should execute sequential workflow', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Hello! How can I help you?',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      const result = await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(result.agentId).toBe('test-agent');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]?.content).toBe('Hello! How can I help you?');
      expect(result.error).toBeUndefined();
      expect(mockChatService.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('should execute routing workflow with multiple steps', async () => {
      // Arrange
      const responses = [
        {
          message: {
            id: 'msg-2',
            conversationId: 'conv-123',
            role: 'assistant' as const,
            content: 'Step 1 complete',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed' as const,
            toolCalls: [{ id: 'tool-1', name: 'test-tool', arguments: {} }],
          },
          finishReason: 'tool-calls' as const,
          toolCalls: [{ id: 'tool-1', name: 'test-tool', arguments: {} }],
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        },
        {
          message: {
            id: 'msg-3',
            conversationId: 'conv-123',
            role: 'assistant' as const,
            content: 'Step 2 complete',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed' as const,
          },
          finishReason: 'stop' as const,
          usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        },
      ];

      mockChatService.sendMessage
        .mockResolvedValueOnce(responses[0]!)
        .mockResolvedValueOnce(responses[1]!);

      // Act
      const result = await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(result.messages).toHaveLength(2);
      expect(result.metadata?.steps).toBe(2);
      expect(result.metadata?.toolCalls).toBe(1);
      expect(mockChatService.sendMessage).toHaveBeenCalledTimes(2);
    });

    it('should handle execution errors', async () => {
      // Arrange
      mockChatService.sendMessage.mockRejectedValue(
        new Error('API call failed'),
      );

      // Act
      const result = await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(result.error).toBe('API call failed');
      expect(result.metadata?.finishReason).toBe('error');
      expect(result.messages).toHaveLength(0);
    });

    it('should respect max steps limit', async () => {
      // Arrange
      const toolCallResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Using tools',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
          toolCalls: [{ id: 'tool-1', name: 'test', arguments: {} }],
        },
        finishReason: 'tool-calls' as const,
        toolCalls: [{ id: 'tool-1', name: 'test', arguments: {} }],
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(toolCallResponse);

      const limitedContext = {
        ...mockContext,
        maxSteps: 3,
      };

      // Act
      const result = await agentExecutor.execute(mockAgent, limitedContext);

      // Assert
      expect(result.metadata?.steps).toBe(3);
      expect(result.metadata?.finishReason).toBe('max_steps');
      expect(mockChatService.sendMessage).toHaveBeenCalledTimes(3);
    });

    it('should handle timeout', async () => {
      // Arrange
      mockChatService.sendMessage.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  message: {
                    id: 'msg-2',
                    conversationId: 'conv-123',
                    role: 'assistant',
                    content: 'Response',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'completed',
                  },
                  finishReason: 'stop',
                }),
              2000,
            ),
          ),
      );

      const shortTimeoutContext = {
        ...mockContext,
        timeout: 100,
      };

      // Act
      const result = await agentExecutor.execute(
        mockAgent,
        shortTimeoutContext,
        { timeout: 100 },
      );

      // Assert
      expect(result.error).toContain('timeout');
      expect(result.metadata?.finishReason).toBe('timeout');
    });

    it('should handle abort signal', async () => {
      // Arrange
      const abortController = new AbortController();
      mockChatService.sendMessage.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  message: {
                    id: 'msg-2',
                    conversationId: 'conv-123',
                    role: 'assistant',
                    content: 'Response',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'completed',
                  },
                  finishReason: 'stop',
                }),
              1000,
            ),
          ),
      );

      // Abort after 50ms
      setTimeout(() => abortController.abort(), 50);

      // Act
      const result = await agentExecutor.execute(mockAgent, mockContext, {
        abortSignal: abortController.signal,
      });

      // Assert
      expect(result.error).toContain('aborted');
      expect(result.metadata?.finishReason).toBe('max_steps');
    });

    it('should report progress', async () => {
      // Arrange
      const progressCallback = jest.fn();
      const responses = [
        {
          message: {
            id: 'msg-2',
            conversationId: 'conv-123',
            role: 'assistant' as const,
            content: 'Step 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed' as const,
            toolCalls: [{ id: 'tool-1', name: 'test', arguments: {} }],
          },
          finishReason: 'tool-calls' as const,
          toolCalls: [{ id: 'tool-1', name: 'test', arguments: {} }],
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        },
        {
          message: {
            id: 'msg-3',
            conversationId: 'conv-123',
            role: 'assistant' as const,
            content: 'Step 2',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed' as const,
          },
          finishReason: 'stop' as const,
          usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        },
      ];

      mockChatService.sendMessage
        .mockResolvedValueOnce(responses[0]!)
        .mockResolvedValueOnce(responses[1]!);

      // Act
      await agentExecutor.execute(mockAgent, mockContext, {
        onProgress: progressCallback,
      });

      // Assert
      expect(progressCallback).toHaveBeenCalledWith(0, 5);
      expect(progressCallback).toHaveBeenCalledWith(1, 5);
      expect(progressCallback).toHaveBeenCalledWith(2, 5);
    });
  });

  describe('Parallel execution', () => {
    it('should execute multiple agents in parallel', async () => {
      // Arrange
      const agents: AgentDefinition[] = [
        { ...mockAgent, id: 'agent-1', name: 'Agent 1' },
        { ...mockAgent, id: 'agent-2', name: 'Agent 2' },
        { ...mockAgent, id: 'agent-3', name: 'Agent 3' },
      ];

      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      const results = await agentExecutor.executeParallel(
        agents,
        mockContext,
      );

      // Assert
      expect(results).toHaveLength(3);
      expect(results[0]?.agentId).toBe('agent-1');
      expect(results[1]?.agentId).toBe('agent-2');
      expect(results[2]?.agentId).toBe('agent-3');
    });

    it('should respect max concurrency', async () => {
      // Arrange
      const agents: AgentDefinition[] = [
        { ...mockAgent, id: 'agent-1' },
        { ...mockAgent, id: 'agent-2' },
        { ...mockAgent, id: 'agent-3' },
        { ...mockAgent, id: 'agent-4' },
      ];

      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      const results = await agentExecutor.executeParallel(agents, mockContext, {
        maxConcurrency: 2,
      });

      // Assert
      expect(results).toHaveLength(4);
    });

    it('should handle parallel execution errors', async () => {
      // Arrange
      const agents: AgentDefinition[] = [
        { ...mockAgent, id: 'agent-1' },
        { ...mockAgent, id: 'agent-2' },
      ];

      mockChatService.sendMessage
        .mockResolvedValueOnce({
          message: {
            id: 'msg-2',
            conversationId: 'conv-123',
            role: 'assistant',
            content: 'Success',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed',
          },
          finishReason: 'stop',
        })
        .mockRejectedValueOnce(new Error('Failed'));

      // Act
      const results = await agentExecutor.executeParallel(
        agents,
        mockContext,
      );

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0]?.error).toBeUndefined();
      expect(results[1]?.error).toBe('Failed');
    });
  });

  describe('Agent configuration', () => {
    it('should use agent system prompt', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: 'You are a helpful assistant.',
        }),
      );
    });

    it('should use agent model configuration', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          modelConfig: expect.objectContaining({
            provider: 'openai',
            modelId: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000,
          }),
        }),
      );
    });

    it('should enable tools if agent has tools', async () => {
      // Arrange
      const agentWithTools = {
        ...mockAgent,
        tools: ['calculator', 'web-search'],
      };

      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      await agentExecutor.execute(agentWithTools, mockContext);

      // Assert
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          toolsEnabled: true,
        }),
      );
    });
  });

  describe('Execution tracking', () => {
    it('should track active executions', async () => {
      // Arrange
      mockChatService.sendMessage.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  message: {
                    id: 'msg-2',
                    conversationId: 'conv-123',
                    role: 'assistant',
                    content: 'Response',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'completed',
                  },
                  finishReason: 'stop',
                }),
              100,
            ),
          ),
      );

      // Act
      const executionPromise = agentExecutor.execute(mockAgent, mockContext);

      // Assert - during execution
      expect(agentExecutor.hasActiveExecutions()).toBe(true);
      expect(agentExecutor.getActiveCount()).toBeGreaterThan(0);

      await executionPromise;

      // Assert - after execution
      expect(agentExecutor.hasActiveExecutions()).toBe(false);
      expect(agentExecutor.getActiveCount()).toBe(0);
    });

    it('should track execution time', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      const result = await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(result.metadata?.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should track token usage', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'Response',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      // Act
      const result = await agentExecutor.execute(mockAgent, mockContext);

      // Assert
      expect(result.metadata?.tokens).toEqual({
        prompt: 100,
        completion: 50,
        total: 150,
      });
    });
  });

  describe('Output extraction', () => {
    it('should extract JSON output from code blocks', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: '```json\n{"result": "success", "value": 42}\n```',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      const contextWithExtraction = {
        ...mockContext,
        sharedData: { extractOutput: true },
      };

      // Act
      const result = await agentExecutor.execute(
        mockAgent,
        contextWithExtraction,
      );

      // Assert
      expect(result.output).toEqual({ result: 'success', value: 42 });
    });

    it('should extract plain JSON output', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: '{"status": "done"}',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      const contextWithExtraction = {
        ...mockContext,
        sharedData: { extractOutput: true },
      };

      // Act
      const result = await agentExecutor.execute(
        mockAgent,
        contextWithExtraction,
      );

      // Assert
      expect(result.output).toEqual({ status: 'done' });
    });

    it('should return text if not valid JSON', async () => {
      // Arrange
      const mockResponse = {
        message: {
          id: 'msg-2',
          conversationId: 'conv-123',
          role: 'assistant' as const,
          content: 'This is plain text',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'completed' as const,
        },
        finishReason: 'stop' as const,
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };

      mockChatService.sendMessage.mockResolvedValue(mockResponse);

      const contextWithExtraction = {
        ...mockContext,
        sharedData: { extractOutput: true },
      };

      // Act
      const result = await agentExecutor.execute(
        mockAgent,
        contextWithExtraction,
      );

      // Assert
      expect(result.output).toBe('This is plain text');
    });
  });
});

/**
 * Tests for Message types and utilities
 */

import {
  Message,
  MessageRole,
  MessageStatus,
  MessageTypeGuards,
  MessageUtils,
  MessageContentPart,
  ToolCall,
} from '../Message';

describe('MessageUtils', () => {
  describe('generateId', () => {
    it('should generate unique message IDs', () => {
      const id1 = MessageUtils.generateId();
      const id2 = MessageUtils.generateId();

      expect(id1).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with msg_ prefix', () => {
      const id = MessageUtils.generateId();
      expect(id.startsWith('msg_')).toBe(true);
    });
  });

  describe('getTextContent', () => {
    it('should return string content as-is', () => {
      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Hello world',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      expect(MessageUtils.getTextContent(message)).toBe('Hello world');
    });

    it('should extract text from structured content', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', text: 'First part' },
        { type: 'text', text: 'Second part' },
      ];

      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: parts,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      expect(MessageUtils.getTextContent(message)).toBe('First part\nSecond part');
    });

    it('should ignore non-text parts in structured content', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', text: 'Text content' },
        { type: 'image', imageUrl: 'https://example.com/image.png' },
        { type: 'text', text: 'More text' },
      ];

      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: parts,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
      };

      expect(MessageUtils.getTextContent(message)).toBe('Text content\nMore text');
    });
  });

  describe('createUserMessage', () => {
    it('should create a valid user message', () => {
      const message = MessageUtils.createUserMessage('conv_1', 'Hello');

      expect(message).toMatchObject({
        conversationId: 'conv_1',
        role: 'user',
        content: 'Hello',
        status: 'pending',
      });
      expect(message.id).toMatch(/^msg_/);
      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.updatedAt).toBeInstanceOf(Date);
    });

    it('should set createdAt and updatedAt to same time', () => {
      const message = MessageUtils.createUserMessage('conv_1', 'Test');
      expect(message.createdAt.getTime()).toBe(message.updatedAt.getTime());
    });
  });

  describe('createAssistantMessageStub', () => {
    it('should create an assistant message stub', () => {
      const message = MessageUtils.createAssistantMessageStub('conv_1');

      expect(message).toMatchObject({
        conversationId: 'conv_1',
        role: 'assistant',
        content: '',
        status: 'streaming',
      });
      expect(message.id).toMatch(/^msg_/);
    });

    it('should have empty content', () => {
      const message = MessageUtils.createAssistantMessageStub('conv_1');
      expect(message.content).toBe('');
    });
  });

  describe('appendContent', () => {
    it('should append content to string message', () => {
      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: 'Hello',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        status: 'streaming',
      };

      const updated = MessageUtils.appendContent(message, ' world');

      expect(updated.content).toBe('Hello world');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(message.updatedAt.getTime());
    });

    it('should not modify structured content', () => {
      const parts: MessageContentPart[] = [
        { type: 'text', text: 'Original' },
      ];

      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: parts,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'streaming',
      };

      const updated = MessageUtils.appendContent(message, ' appended');

      expect(updated.content).toBe(parts);
    });

    it('should not mutate original message', () => {
      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: 'Hello',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'streaming',
      };

      const updated = MessageUtils.appendContent(message, ' world');

      expect(message.content).toBe('Hello');
      expect(updated.content).toBe('Hello world');
    });
  });

  describe('markCompleted', () => {
    it('should mark message as completed', () => {
      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: 'Test',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        status: 'streaming',
      };

      const completed = MessageUtils.markCompleted(message);

      expect(completed.status).toBe('completed');
      expect(completed.updatedAt.getTime()).toBeGreaterThan(message.updatedAt.getTime());
    });

    it('should not mutate original message', () => {
      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'streaming',
      };

      const completed = MessageUtils.markCompleted(message);

      expect(message.status).toBe('streaming');
      expect(completed.status).toBe('completed');
    });
  });

  describe('markError', () => {
    it('should mark message as error with error message', () => {
      const message: Message = {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'assistant',
        content: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'streaming',
      };

      const errored = MessageUtils.markError(message, 'Network error');

      expect(errored.status).toBe('error');
      expect(errored.error).toBe('Network error');
    });
  });
});

describe('MessageTypeGuards', () => {
  const createMessage = (role: MessageRole, status: MessageStatus = 'completed'): Message => ({
    id: 'msg_1',
    conversationId: 'conv_1',
    role,
    content: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
    status,
  });

  describe('isUserMessage', () => {
    it('should return true for user messages', () => {
      expect(MessageTypeGuards.isUserMessage(createMessage('user'))).toBe(true);
    });

    it('should return false for non-user messages', () => {
      expect(MessageTypeGuards.isUserMessage(createMessage('assistant'))).toBe(false);
      expect(MessageTypeGuards.isUserMessage(createMessage('system'))).toBe(false);
    });
  });

  describe('isAssistantMessage', () => {
    it('should return true for assistant messages', () => {
      expect(MessageTypeGuards.isAssistantMessage(createMessage('assistant'))).toBe(true);
    });

    it('should return false for non-assistant messages', () => {
      expect(MessageTypeGuards.isAssistantMessage(createMessage('user'))).toBe(false);
    });
  });

  describe('isSystemMessage', () => {
    it('should return true for system messages', () => {
      expect(MessageTypeGuards.isSystemMessage(createMessage('system'))).toBe(true);
    });

    it('should return false for non-system messages', () => {
      expect(MessageTypeGuards.isSystemMessage(createMessage('user'))).toBe(false);
    });
  });

  describe('hasToolCalls', () => {
    it('should return true when message has tool calls', () => {
      const message = createMessage('assistant');
      const toolCall: ToolCall = {
        id: 'tool_1',
        name: 'getWeather',
        arguments: { location: 'SF' },
        status: 'completed',
      };
      message.toolCalls = [toolCall];

      expect(MessageTypeGuards.hasToolCalls(message)).toBe(true);
    });

    it('should return false when message has no tool calls', () => {
      const message = createMessage('assistant');
      expect(MessageTypeGuards.hasToolCalls(message)).toBe(false);
    });

    it('should return false when toolCalls array is empty', () => {
      const message = createMessage('assistant');
      message.toolCalls = [];
      expect(MessageTypeGuards.hasToolCalls(message)).toBe(false);
    });
  });

  describe('isStreaming', () => {
    it('should return true for streaming messages', () => {
      expect(MessageTypeGuards.isStreaming(createMessage('assistant', 'streaming'))).toBe(true);
    });

    it('should return false for non-streaming messages', () => {
      expect(MessageTypeGuards.isStreaming(createMessage('assistant', 'completed'))).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('should return true for completed messages', () => {
      expect(MessageTypeGuards.isCompleted(createMessage('assistant', 'completed'))).toBe(true);
    });

    it('should return false for non-completed messages', () => {
      expect(MessageTypeGuards.isCompleted(createMessage('assistant', 'streaming'))).toBe(false);
    });
  });

  describe('hasError', () => {
    it('should return true when status is error', () => {
      expect(MessageTypeGuards.hasError(createMessage('assistant', 'error'))).toBe(true);
    });

    it('should return true when error field is set', () => {
      const message = createMessage('assistant', 'completed');
      message.error = 'Something went wrong';
      expect(MessageTypeGuards.hasError(message)).toBe(true);
    });

    it('should return false when no error', () => {
      expect(MessageTypeGuards.hasError(createMessage('assistant', 'completed'))).toBe(false);
    });
  });

  describe('hasStructuredContent', () => {
    it('should return true for structured content', () => {
      const message = createMessage('assistant');
      message.content = [{ type: 'text', text: 'Test' }];

      expect(MessageTypeGuards.hasStructuredContent(message)).toBe(true);
    });

    it('should return false for string content', () => {
      const message = createMessage('assistant');
      expect(MessageTypeGuards.hasStructuredContent(message)).toBe(false);
    });
  });
});

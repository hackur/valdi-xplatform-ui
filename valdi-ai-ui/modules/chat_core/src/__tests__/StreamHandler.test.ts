/**
 * StreamHandler Tests
 *
 * Comprehensive unit tests for StreamHandler service.
 * Tests stream management, event handling, and utility functions.
 */

import { StreamHandler, StreamUtils } from '../StreamHandler';
import { StreamEvent, StreamingStatus } from '../types';
import { Message, MessageRole, MessageStatus } from '@common/types';

describe('StreamHandler', () => {
  let handler: StreamHandler;

  beforeEach(() => {
    handler = new StreamHandler();
  });

  afterEach(() => {
    handler.clearCallbacks();
  });

  describe('Initialization', () => {
    it('should initialize with idle status', () => {
      expect(handler.getStatus()).toBe('idle');
      expect(handler.isStreaming()).toBe(false);
      expect(handler.getCurrentMessageId()).toBeUndefined();
      expect(handler.getContent()).toBe('');
    });
  });

  describe('Stream Lifecycle', () => {
    describe('start', () => {
      it('should start a new stream', () => {
        handler.start('msg-1');

        expect(handler.getStatus()).toBe('connecting');
        expect(handler.getCurrentMessageId()).toBe('msg-1');
        expect(handler.getContent()).toBe('');
      });

      it('should emit start event', () => {
        const callback = jest.fn();
        handler.onEvent(callback);

        handler.start('msg-1');

        expect(callback).toHaveBeenCalledWith({
          type: 'start',
          messageId: 'msg-1',
        });
      });

      it('should reset content buffer', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'some content');

        handler.start('msg-2');

        expect(handler.getContent()).toBe('');
      });
    });

    describe('processChunk', () => {
      it('should process chunk and accumulate content', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'Hello');

        expect(handler.getContent()).toBe('Hello');
        expect(handler.getStatus()).toBe('streaming');
      });

      it('should accumulate multiple chunks', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'Hello');
        handler.processChunk('msg-1', ' world');
        handler.processChunk('msg-1', '!');

        expect(handler.getContent()).toBe('Hello world!');
      });

      it('should emit chunk event with delta and full content', () => {
        const callback = jest.fn();
        handler.onEvent(callback);

        handler.start('msg-1');
        handler.processChunk('msg-1', 'Hello');
        handler.processChunk('msg-1', ' world');

        expect(callback).toHaveBeenCalledWith({
          type: 'chunk',
          messageId: 'msg-1',
          content: 'Hello world',
          delta: ' world',
        });
      });

      it('should change status from connecting to streaming', () => {
        handler.start('msg-1');
        expect(handler.getStatus()).toBe('connecting');

        handler.processChunk('msg-1', 'chunk');
        expect(handler.getStatus()).toBe('streaming');
      });

      it('should handle empty chunks', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', '');

        expect(handler.getContent()).toBe('');
        expect(handler.getStatus()).toBe('streaming');
      });
    });

    describe('complete', () => {
      it('should complete the stream', () => {
        const message = createMockMessage('msg-1', 'Final content');

        handler.start('msg-1');
        handler.processChunk('msg-1', 'Final content');
        handler.complete('msg-1', message);

        expect(handler.getStatus()).toBe('idle');
        expect(handler.getCurrentMessageId()).toBeUndefined();
        expect(handler.getContent()).toBe('');
      });

      it('should emit complete event', () => {
        const callback = jest.fn();
        const message = createMockMessage('msg-1', 'Content');

        handler.onEvent(callback);
        handler.start('msg-1');
        handler.complete('msg-1', message);

        expect(callback).toHaveBeenCalledWith({
          type: 'complete',
          messageId: 'msg-1',
          message,
        });
      });

      it('should reset handler state', () => {
        const message = createMockMessage('msg-1', 'Content');

        handler.start('msg-1');
        handler.processChunk('msg-1', 'Content');
        handler.complete('msg-1', message);

        expect(handler.getStatus()).toBe('idle');
        expect(handler.getCurrentMessageId()).toBeUndefined();
        expect(handler.getContent()).toBe('');
      });
    });

    describe('error', () => {
      it('should handle stream error', () => {
        handler.start('msg-1');
        handler.error('msg-1', 'Connection failed');

        expect(handler.getStatus()).toBe('idle');
        expect(handler.getCurrentMessageId()).toBeUndefined();
      });

      it('should emit error event', () => {
        const callback = jest.fn();
        handler.onEvent(callback);

        handler.start('msg-1');
        handler.error('msg-1', 'Test error');

        expect(callback).toHaveBeenCalledWith({
          type: 'error',
          messageId: 'msg-1',
          error: 'Test error',
        });
      });

      it('should reset handler state after error', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'Some content');
        handler.error('msg-1', 'Error occurred');

        expect(handler.getStatus()).toBe('idle');
        expect(handler.getContent()).toBe('');
      });
    });
  });

  describe('State Management', () => {
    describe('getStatus', () => {
      it('should return current status', () => {
        expect(handler.getStatus()).toBe('idle');

        handler.start('msg-1');
        expect(handler.getStatus()).toBe('connecting');

        handler.processChunk('msg-1', 'chunk');
        expect(handler.getStatus()).toBe('streaming');
      });
    });

    describe('isStreaming', () => {
      it('should return true when streaming', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'chunk');

        expect(handler.isStreaming()).toBe(true);
      });

      it('should return true when connecting', () => {
        handler.start('msg-1');

        expect(handler.isStreaming()).toBe(true);
      });

      it('should return false when idle', () => {
        expect(handler.isStreaming()).toBe(false);
      });

      it('should return false when completed', () => {
        handler.start('msg-1');
        handler.complete('msg-1', createMockMessage('msg-1'));

        expect(handler.isStreaming()).toBe(false);
      });

      it('should return false when error', () => {
        handler.start('msg-1');
        handler.error('msg-1', 'error');

        expect(handler.isStreaming()).toBe(false);
      });
    });

    describe('getCurrentMessageId', () => {
      it('should return current message ID when streaming', () => {
        handler.start('msg-1');

        expect(handler.getCurrentMessageId()).toBe('msg-1');
      });

      it('should return undefined when not streaming', () => {
        expect(handler.getCurrentMessageId()).toBeUndefined();
      });

      it('should return undefined after completion', () => {
        handler.start('msg-1');
        handler.complete('msg-1', createMockMessage('msg-1'));

        expect(handler.getCurrentMessageId()).toBeUndefined();
      });
    });

    describe('getContent', () => {
      it('should return accumulated content', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'Hello ');
        handler.processChunk('msg-1', 'world');

        expect(handler.getContent()).toBe('Hello world');
      });

      it('should return empty string when no content', () => {
        expect(handler.getContent()).toBe('');
      });
    });

    describe('reset', () => {
      it('should reset all state', () => {
        handler.start('msg-1');
        handler.processChunk('msg-1', 'content');

        handler.reset();

        expect(handler.getStatus()).toBe('idle');
        expect(handler.getCurrentMessageId()).toBeUndefined();
        expect(handler.getContent()).toBe('');
      });
    });
  });

  describe('Event Callbacks', () => {
    describe('onEvent', () => {
      it('should register callback and return unsubscribe function', () => {
        const callback = jest.fn();
        const unsubscribe = handler.onEvent(callback);

        expect(typeof unsubscribe).toBe('function');

        handler.start('msg-1');
        expect(callback).toHaveBeenCalled();
      });

      it('should call multiple callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        handler.onEvent(callback1);
        handler.onEvent(callback2);

        handler.start('msg-1');

        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
      });

      it('should stop calling callback after unsubscribe', () => {
        const callback = jest.fn();
        const unsubscribe = handler.onEvent(callback);

        handler.start('msg-1');
        expect(callback).toHaveBeenCalledTimes(1);

        unsubscribe();

        handler.processChunk('msg-1', 'chunk');
        expect(callback).toHaveBeenCalledTimes(1); // Not called again
      });

      it('should pass correct event data to callbacks', () => {
        const events: StreamEvent[] = [];
        handler.onEvent((event) => events.push(event));

        handler.start('msg-1');
        handler.processChunk('msg-1', 'test');
        handler.complete('msg-1', createMockMessage('msg-1'));

        expect(events).toHaveLength(3);
        expect(events[0]?.type).toBe('start');
        expect(events[1]?.type).toBe('chunk');
        expect(events[2]?.type).toBe('complete');
      });
    });

    describe('clearCallbacks', () => {
      it('should remove all callbacks', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        handler.onEvent(callback1);
        handler.onEvent(callback2);

        handler.clearCallbacks();

        handler.start('msg-1');

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
      });
    });
  });

  describe('Stream Scenarios', () => {
    it('should handle complete stream lifecycle', () => {
      const events: StreamEvent[] = [];
      handler.onEvent((event) => events.push(event));

      // Start stream
      handler.start('msg-1');

      // Process multiple chunks
      handler.processChunk('msg-1', 'Hello');
      handler.processChunk('msg-1', ' ');
      handler.processChunk('msg-1', 'world');

      // Complete stream
      const message = createMockMessage('msg-1', 'Hello world');
      handler.complete('msg-1', message);

      expect(events).toHaveLength(5); // start + 3 chunks + complete
      expect(handler.getContent()).toBe('');
      expect(handler.getStatus()).toBe('idle');
    });

    it('should handle stream with error', () => {
      const events: StreamEvent[] = [];
      handler.onEvent((event) => events.push(event));

      handler.start('msg-1');
      handler.processChunk('msg-1', 'Partial');
      handler.error('msg-1', 'Network error');

      expect(events).toHaveLength(3); // start + chunk + error
      expect(events[2]?.type).toBe('error');
      expect(handler.getStatus()).toBe('idle');
    });

    it('should handle rapid consecutive chunks', () => {
      const callback = jest.fn();
      handler.onEvent(callback);

      handler.start('msg-1');

      // Simulate rapid streaming
      for (let i = 0; i < 100; i++) {
        handler.processChunk('msg-1', 'x');
      }

      expect(handler.getContent()).toHaveLength(100);
      expect(callback).toHaveBeenCalledTimes(101); // start + 100 chunks
    });

    it('should handle restarting stream with different message', () => {
      handler.start('msg-1');
      handler.processChunk('msg-1', 'First message');

      handler.start('msg-2');
      handler.processChunk('msg-2', 'Second message');

      expect(handler.getCurrentMessageId()).toBe('msg-2');
      expect(handler.getContent()).toBe('Second message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle processing chunk without start', () => {
      handler.processChunk('msg-1', 'chunk');

      expect(handler.getStatus()).toBe('streaming');
      expect(handler.getContent()).toBe('chunk');
    });

    it('should handle complete without start', () => {
      const message = createMockMessage('msg-1');
      handler.complete('msg-1', message);

      expect(handler.getStatus()).toBe('idle');
    });

    it('should handle error without start', () => {
      handler.error('msg-1', 'error');

      expect(handler.getStatus()).toBe('idle');
    });

    it('should handle very long content', () => {
      const longChunk = 'x'.repeat(10000);

      handler.start('msg-1');
      handler.processChunk('msg-1', longChunk);

      expect(handler.getContent()).toHaveLength(10000);
    });

    it('should handle special characters in chunks', () => {
      handler.start('msg-1');
      handler.processChunk('msg-1', '< > & " \' \n \t');

      expect(handler.getContent()).toBe('< > & " \' \n \t');
    });

    it('should handle unicode characters', () => {
      handler.start('msg-1');
      handler.processChunk('msg-1', '你好');
      handler.processChunk('msg-1', ' ');
      handler.processChunk('msg-1', '🚀');

      expect(handler.getContent()).toBe('你好 🚀');
    });
  });
});

describe('StreamUtils', () => {
  describe('createDebouncedProcessor', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce rapid updates', () => {
      const callback = jest.fn();
      const processor = StreamUtils.createDebouncedProcessor(callback, 50);

      processor('Hello');
      processor(' world');
      processor('!');

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('Hello world!', 'Hello world!');
    });

    it('should accumulate content correctly', () => {
      const callback = jest.fn();
      const processor = StreamUtils.createDebouncedProcessor(callback, 50);

      processor('A');
      processor('B');
      processor('C');

      jest.advanceTimersByTime(50);

      expect(callback).toHaveBeenCalledWith('ABC', 'ABC');
    });

    it('should reset buffer after callback', () => {
      const callback = jest.fn();
      const processor = StreamUtils.createDebouncedProcessor(callback, 50);

      processor('First');
      jest.advanceTimersByTime(50);

      callback.mockClear();

      processor(' Second');
      jest.advanceTimersByTime(50);

      expect(callback).toHaveBeenCalledWith('First Second', ' Second');
    });

    it('should restart timer on new input', () => {
      const callback = jest.fn();
      const processor = StreamUtils.createDebouncedProcessor(callback, 50);

      processor('A');
      jest.advanceTimersByTime(25);

      processor('B');
      jest.advanceTimersByTime(25);

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(25);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should use custom delay', () => {
      const callback = jest.fn();
      const processor = StreamUtils.createDebouncedProcessor(callback, 100);

      processor('test');

      jest.advanceTimersByTime(50);
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(callback).toHaveBeenCalled();
    });

    it('should use default delay of 16ms', () => {
      const callback = jest.fn();
      const processor = StreamUtils.createDebouncedProcessor(callback);

      processor('test');

      jest.advanceTimersByTime(16);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('wordSplitter', () => {
    it('should split text into words', () => {
      const words = Array.from(StreamUtils.wordSplitter('Hello world'));

      expect(words).toEqual(['Hello', ' ', 'world']);
    });

    it('should preserve multiple spaces', () => {
      const words = Array.from(StreamUtils.wordSplitter('Hello    world'));

      expect(words).toEqual(['Hello', '    ', 'world']);
    });

    it('should handle empty string', () => {
      const words = Array.from(StreamUtils.wordSplitter(''));

      expect(words).toEqual(['']);
    });

    it('should handle single word', () => {
      const words = Array.from(StreamUtils.wordSplitter('Hello'));

      expect(words).toEqual(['Hello']);
    });

    it('should handle text with newlines', () => {
      const words = Array.from(StreamUtils.wordSplitter('Hello\nworld'));

      expect(words).toEqual(['Hello', '\n', 'world']);
    });

    it('should handle text with tabs', () => {
      const words = Array.from(StreamUtils.wordSplitter('Hello\tworld'));

      expect(words).toEqual(['Hello', '\t', 'world']);
    });

    it('should handle punctuation', () => {
      const words = Array.from(StreamUtils.wordSplitter('Hello, world!'));

      expect(words).toEqual(['Hello,', ' ', 'world!']);
    });
  });

  describe('calculateStats', () => {
    it('should calculate duration and tokens per second', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const endTime = new Date('2024-01-01T00:00:10Z'); // 10 seconds later
      const tokenCount = 100;

      const stats = StreamUtils.calculateStats(startTime, endTime, tokenCount);

      expect(stats.duration).toBe(10);
      expect(stats.tokensPerSecond).toBe(10);
    });

    it('should handle fractional seconds', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const endTime = new Date('2024-01-01T00:00:00.500Z'); // 500ms later
      const tokenCount = 50;

      const stats = StreamUtils.calculateStats(startTime, endTime, tokenCount);

      expect(stats.duration).toBe(0.5);
      expect(stats.tokensPerSecond).toBe(100);
    });

    it('should handle zero duration', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      const tokenCount = 10;

      const stats = StreamUtils.calculateStats(time, time, tokenCount);

      expect(stats.duration).toBe(0);
      expect(stats.tokensPerSecond).toBe(Infinity);
    });

    it('should handle large token counts', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const endTime = new Date('2024-01-01T00:01:00Z'); // 60 seconds
      const tokenCount = 10000;

      const stats = StreamUtils.calculateStats(startTime, endTime, tokenCount);

      expect(stats.duration).toBe(60);
      expect(stats.tokensPerSecond).toBeCloseTo(166.67, 1);
    });

    it('should handle millisecond precision', () => {
      const startTime = new Date('2024-01-01T00:00:00.000Z');
      const endTime = new Date('2024-01-01T00:00:00.100Z'); // 100ms
      const tokenCount = 10;

      const stats = StreamUtils.calculateStats(startTime, endTime, tokenCount);

      expect(stats.duration).toBe(0.1);
      expect(stats.tokensPerSecond).toBe(100);
    });

    it('should return correct structure', () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 1000);
      const tokenCount = 10;

      const stats = StreamUtils.calculateStats(startTime, endTime, tokenCount);

      expect(stats).toHaveProperty('duration');
      expect(stats).toHaveProperty('tokensPerSecond');
      expect(typeof stats.duration).toBe('number');
      expect(typeof stats.tokensPerSecond).toBe('number');
    });
  });
});

// Test Helper Functions

function createMockMessage(
  messageId: string,
  content: string = 'Test message',
): Message {
  return {
    id: messageId,
    conversationId: 'conv-1',
    role: 'assistant' as MessageRole,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'completed' as MessageStatus,
  };
}

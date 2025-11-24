/**
 * StreamHandler
 *
 * Utility class for handling streaming responses from AI models.
 * Provides helpers for managing stream state and processing chunks.
 */

import { Message } from '../../common/src';
import { StreamEvent, StreamCallback, StreamingStatus } from './types';

/**
 * StreamHandler Class
 *
 * Manages the lifecycle and state of streaming AI responses
 */
export class StreamHandler {
  private status: StreamingStatus = 'idle';
  private currentMessageId?: string;
  private contentBuffer: string = '';
  private callbacks: Set<StreamCallback> = new Set();

  /**
   * Register a callback for stream events
   */
  onEvent(callback: StreamCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Emit an event to all callbacks
   */
  private emit(event: StreamEvent): void {
    this.callbacks.forEach((callback) => callback(event));
  }

  /**
   * Start a new stream
   */
  start(messageId: string): void {
    this.status = 'connecting';
    this.currentMessageId = messageId;
    this.contentBuffer = '';

    this.emit({ type: 'start', messageId });
  }

  /**
   * Process a chunk of streamed content
   */
  processChunk(messageId: string, delta: string): void {
    // Transition from connecting to streaming state on first chunk
    // This ensures status reflects actual data flow
    if (this.status !== 'streaming' && this.status !== 'connecting') {
      this.status = 'streaming';
    }

    // Accumulate delta into buffer for complete content tracking
    // Buffer maintains full message history for UI display
    this.contentBuffer += delta;

    // Emit both incremental delta and accumulated content
    // Delta allows for smooth character-by-character rendering
    // Content provides complete text for immediate UI updates
    this.emit({
      type: 'chunk',
      messageId,
      content: this.contentBuffer,
      delta,
    });
  }

  /**
   * Complete the stream
   */
  complete(messageId: string, message: Message): void {
    this.status = 'completed';

    this.emit({
      type: 'complete',
      messageId,
      message,
    });

    // Clean up state after successful completion
    // Reset prepares handler for next stream without state leakage
    this.reset();
  }

  /**
   * Handle stream error
   */
  error(messageId: string, error: string): void {
    this.status = 'error';

    this.emit({
      type: 'error',
      messageId,
      error,
    });

    // Reset state after error to prepare for new stream
    // This prevents error state pollution across streams
    this.reset();
  }

  /**
   * Get current streaming status
   */
  getStatus(): StreamingStatus {
    return this.status;
  }

  /**
   * Check if currently streaming
   */
  isStreaming(): boolean {
    return this.status === 'streaming' || this.status === 'connecting';
  }

  /**
   * Get current message ID
   */
  getCurrentMessageId(): string | undefined {
    return this.currentMessageId;
  }

  /**
   * Get buffered content
   */
  getContent(): string {
    return this.contentBuffer;
  }

  /**
   * Reset handler state
   */
  reset(): void {
    this.status = 'idle';
    this.currentMessageId = undefined;
    this.contentBuffer = '';
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.callbacks.clear();
  }
}

/**
 * Stream Helper Utilities
 */
export const StreamUtils = {
  /**
   * Create a debounced stream processor
   * Batches rapid chunks to reduce UI updates
   */
  createDebouncedProcessor(
    callback: (content: string, delta: string) => void,
    delay: number = 16, // ~60fps
  ): (delta: string) => void {
    let buffer = '';
    let content = '';
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (delta: string) => {
      // Accumulate deltas into buffers
      // buffer: holds deltas since last callback
      // content: holds all deltas for complete text
      buffer += delta;
      content += delta;

      // Cancel pending callback to implement debouncing
      // This prevents excessive UI updates during rapid streaming
      if (timeout) {
        clearTimeout(timeout);
      }

      // Schedule new callback after delay
      // 16ms default provides smooth 60fps update rate
      // Balances responsiveness with performance
      timeout = setTimeout(() => {
        callback(content, buffer);
        buffer = ''; // Reset buffer after processing
        timeout = null;
      }, delay);
    };
  },

  /**
   * Split stream into words for smoother animation
   */
  *wordSplitter(text: string): Generator<string> {
    // Split on whitespace while preserving spaces in results
    // Regex capture group (\s+) includes spaces in array
    const words = text.split(/(\s+)/);

    // Yield each word/space individually for word-by-word streaming
    // Generator pattern allows lazy evaluation for memory efficiency
    for (const word of words) {
      yield word;
    }
  },

  /**
   * Calculate streaming stats
   */
  calculateStats(
    startTime: Date,
    endTime: Date,
    tokenCount: number,
  ): {
    duration: number;
    tokensPerSecond: number;
  } {
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    const tokensPerSecond = tokenCount / duration;

    return { duration, tokensPerSecond };
  },
};

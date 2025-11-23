/**
 * ExportService
 *
 * Handles exporting and importing conversations and messages.
 * Supports multiple formats: JSON, Markdown, and plain text.
 */

import { Conversation, Message, MessageUtils, ConversationUtils } from 'common/src/types';
import { MessagePersistence } from './MessagePersistence';
import { ConversationPersistence } from './ConversationPersistence';

/**
 * Export Format Types
 */
export type ExportFormat = 'json' | 'markdown' | 'text';

/**
 * Export Options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;

  /** Include metadata in export */
  includeMetadata?: boolean;

  /** Include timestamps */
  includeTimestamps?: boolean;

  /** Include model configuration */
  includeModelConfig?: boolean;

  /** Include system prompt */
  includeSystemPrompt?: boolean;

  /** Pretty print JSON */
  prettyPrint?: boolean;
}

/**
 * Export Result
 */
export interface ExportResult {
  /** Exported data as string */
  data: string;

  /** File name suggestion */
  filename: string;

  /** MIME type */
  mimeType: string;

  /** Size in bytes */
  size: number;
}

/**
 * Import Result
 */
export interface ImportResult {
  /** Number of conversations imported */
  conversationCount: number;

  /** Number of messages imported */
  messageCount: number;

  /** Any errors encountered */
  errors: string[];
}

/**
 * Export Service Class
 *
 * Provides functionality to export and import conversations
 * in various formats (JSON, Markdown, Text).
 */
export class ExportService {
  private messagePersistence: MessagePersistence;
  private conversationPersistence: ConversationPersistence;

  constructor(
    messagePersistence?: MessagePersistence,
    conversationPersistence?: ConversationPersistence
  ) {
    this.messagePersistence = messagePersistence || new MessagePersistence();
    this.conversationPersistence = conversationPersistence || new ConversationPersistence();
  }

  /**
   * Export a conversation with its messages
   */
  async exportConversation(
    conversationId: string,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    const defaults: ExportOptions = {
      format: 'json',
      includeMetadata: true,
      includeTimestamps: true,
      includeModelConfig: true,
      includeSystemPrompt: true,
      prettyPrint: true,
    };

    const config = { ...defaults, ...options };

    // Load conversation and messages
    const conversation = await this.conversationPersistence.loadConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const messages = await this.messagePersistence.loadMessages(conversationId);

    // Generate export based on format
    let data: string;
    let filename: string;
    let mimeType: string;

    switch (config.format) {
      case 'json':
        data = this.exportToJSON(conversation, messages, config);
        filename = this.getFilename(conversation, 'json');
        mimeType = 'application/json';
        break;

      case 'markdown':
        data = this.exportToMarkdown(conversation, messages, config);
        filename = this.getFilename(conversation, 'md');
        mimeType = 'text/markdown';
        break;

      case 'text':
        data = this.exportToText(conversation, messages, config);
        filename = this.getFilename(conversation, 'txt');
        mimeType = 'text/plain';
        break;

      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }

    return {
      data,
      filename,
      mimeType,
      size: new Blob([data]).size,
    };
  }

  /**
   * Export multiple conversations
   */
  async exportConversations(
    conversationIds: string[],
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    const config: ExportOptions = {
      format: 'json',
      includeMetadata: true,
      includeTimestamps: true,
      includeModelConfig: true,
      includeSystemPrompt: true,
      prettyPrint: true,
      ...options,
    };

    const exports = await Promise.all(
      conversationIds.map(async (id) => {
        const conversation = await this.conversationPersistence.loadConversation(id);
        const messages = await this.messagePersistence.loadMessages(id);
        return { conversation, messages };
      })
    );

    const validExports = exports.filter((e) => e.conversation !== null);

    let data: string;
    let filename: string;
    let mimeType: string;

    if (config.format === 'json') {
      const jsonData = validExports.map((e) => ({
        conversation: e.conversation,
        messages: e.messages,
      }));
      data = config.prettyPrint
        ? JSON.stringify(jsonData, null, 2)
        : JSON.stringify(jsonData);
      filename = `valdi-conversations-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      // For markdown/text, concatenate individual exports
      const parts = validExports.map((e, index) => {
        if (config.format === 'markdown') {
          return this.exportToMarkdown(e.conversation!, e.messages, config);
        } else {
          return this.exportToText(e.conversation!, e.messages, config);
        }
      });

      const separator = config.format === 'markdown'
        ? '\n\n---\n\n'
        : '\n\n' + '='.repeat(80) + '\n\n';

      data = parts.join(separator);
      filename = `valdi-conversations-${Date.now()}.${config.format === 'markdown' ? 'md' : 'txt'}`;
      mimeType = config.format === 'markdown' ? 'text/markdown' : 'text/plain';
    }

    return {
      data,
      filename,
      mimeType,
      size: new Blob([data]).size,
    };
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(
    conversation: Conversation,
    messages: Message[],
    options: ExportOptions
  ): string {
    const data: Record<string, unknown> = {
      conversation: {
        id: conversation.id,
        title: conversation.title,
      },
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        ...(options.includeTimestamps && {
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        }),
        ...(options.includeMetadata && m.metadata && { metadata: m.metadata }),
      })),
    };

    if (options.includeSystemPrompt && conversation.systemPrompt) {
      (data.conversation as Record<string, unknown>).systemPrompt = conversation.systemPrompt;
    }

    if (options.includeModelConfig) {
      (data.conversation as Record<string, unknown>).modelConfig = conversation.modelConfig;
    }

    if (options.includeMetadata) {
      (data.conversation as Record<string, unknown>).metadata = {
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessageAt: conversation.lastMessageAt?.toISOString(),
        messageCount: conversation.messageCount,
        tags: conversation.tags,
        status: conversation.status,
        isPinned: conversation.isPinned,
        ...(conversation.metadata && { custom: conversation.metadata }),
      };
    }

    return options.prettyPrint
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(
    conversation: Conversation,
    messages: Message[],
    options: ExportOptions
  ): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${conversation.title}`);
    lines.push('');

    // Metadata section
    if (options.includeMetadata) {
      lines.push('## Metadata');
      lines.push('');
      lines.push(`- **Created**: ${conversation.createdAt.toLocaleString()}`);
      lines.push(`- **Updated**: ${conversation.updatedAt.toLocaleString()}`);
      if (conversation.lastMessageAt) {
        lines.push(`- **Last Message**: ${conversation.lastMessageAt.toLocaleString()}`);
      }
      lines.push(`- **Messages**: ${conversation.messageCount}`);
      lines.push(`- **Status**: ${conversation.status}`);
      if (conversation.tags.length > 0) {
        lines.push(`- **Tags**: ${conversation.tags.join(', ')}`);
      }
      lines.push('');
    }

    // Model configuration
    if (options.includeModelConfig) {
      lines.push('## Model Configuration');
      lines.push('');
      lines.push(`- **Provider**: ${conversation.modelConfig.provider}`);
      lines.push(`- **Model**: ${conversation.modelConfig.modelId}`);
      if (conversation.modelConfig.temperature !== undefined) {
        lines.push(`- **Temperature**: ${conversation.modelConfig.temperature}`);
      }
      if (conversation.modelConfig.maxTokens !== undefined) {
        lines.push(`- **Max Tokens**: ${conversation.modelConfig.maxTokens}`);
      }
      lines.push('');
    }

    // System prompt
    if (options.includeSystemPrompt && conversation.systemPrompt) {
      lines.push('## System Prompt');
      lines.push('');
      lines.push('```');
      lines.push(conversation.systemPrompt);
      lines.push('```');
      lines.push('');
    }

    // Messages
    lines.push('## Conversation');
    lines.push('');

    messages.forEach((message) => {
      // Role header
      const roleEmoji = {
        user: '👤',
        assistant: '🤖',
        system: '⚙️',
        tool: '🔧',
      }[message.role];

      lines.push(`### ${roleEmoji} ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}`);
      lines.push('');

      // Timestamp
      if (options.includeTimestamps) {
        lines.push(`*${message.createdAt.toLocaleString()}*`);
        lines.push('');
      }

      // Content
      const content = typeof message.content === 'string'
        ? message.content
        : MessageUtils.getTextContent(message);

      lines.push(content);
      lines.push('');

      // Tool calls
      if (message.toolCalls && message.toolCalls.length > 0) {
        lines.push('**Tool Calls:**');
        lines.push('');
        message.toolCalls.forEach((tool) => {
          lines.push(`- **${tool.name}**`);
          lines.push(`  - Status: ${tool.status}`);
          if (tool.result) {
            lines.push(`  - Result: \`${JSON.stringify(tool.result)}\``);
          }
        });
        lines.push('');
      }

      // Metadata
      if (options.includeMetadata && message.metadata) {
        if (message.metadata.model) {
          lines.push(`*Model: ${message.metadata.model}*`);
        }
        if (message.metadata.tokens) {
          lines.push(`*Tokens: ${message.metadata.tokens.total}*`);
        }
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  /**
   * Export to plain text format
   */
  private exportToText(
    conversation: Conversation,
    messages: Message[],
    options: ExportOptions
  ): string {
    const lines: string[] = [];

    // Header
    lines.push('='.repeat(80));
    lines.push(conversation.title);
    lines.push('='.repeat(80));
    lines.push('');

    // Metadata
    if (options.includeMetadata) {
      lines.push('METADATA:');
      lines.push(`  Created: ${conversation.createdAt.toLocaleString()}`);
      lines.push(`  Updated: ${conversation.updatedAt.toLocaleString()}`);
      lines.push(`  Messages: ${conversation.messageCount}`);
      lines.push(`  Status: ${conversation.status}`);
      if (conversation.tags.length > 0) {
        lines.push(`  Tags: ${conversation.tags.join(', ')}`);
      }
      lines.push('');
    }

    // Model config
    if (options.includeModelConfig) {
      lines.push('MODEL:');
      lines.push(`  Provider: ${conversation.modelConfig.provider}`);
      lines.push(`  Model ID: ${conversation.modelConfig.modelId}`);
      lines.push('');
    }

    // System prompt
    if (options.includeSystemPrompt && conversation.systemPrompt) {
      lines.push('SYSTEM PROMPT:');
      lines.push(conversation.systemPrompt);
      lines.push('');
    }

    // Messages
    lines.push('CONVERSATION:');
    lines.push('-'.repeat(80));
    lines.push('');

    messages.forEach((message, index) => {
      const roleLabel = message.role.toUpperCase();
      lines.push(`[${roleLabel}]`);

      if (options.includeTimestamps) {
        lines.push(`Time: ${message.createdAt.toLocaleString()}`);
      }

      lines.push('');

      const content = typeof message.content === 'string'
        ? message.content
        : MessageUtils.getTextContent(message);

      lines.push(content);
      lines.push('');

      if (message.toolCalls && message.toolCalls.length > 0) {
        lines.push('Tool Calls:');
        message.toolCalls.forEach((tool) => {
          lines.push(`  - ${tool.name}: ${tool.status}`);
        });
        lines.push('');
      }

      if (index < messages.length - 1) {
        lines.push('-'.repeat(80));
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  /**
   * Import conversation from JSON
   */
  async importConversation(jsonData: string): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let conversationCount = 0;
      let messageCount = 0;

      // Check if it's a single conversation or multiple
      const isArray = Array.isArray(data);
      const conversations = isArray ? data : [data];

      for (const item of conversations) {
        try {
          const { conversation, messages } = item;

          // Restore conversation
          const restoredConversation: Conversation = {
            id: conversation.id,
            title: conversation.title,
            systemPrompt: conversation.systemPrompt,
            modelConfig: conversation.modelConfig,
            createdAt: new Date(conversation.metadata?.createdAt || Date.now()),
            updatedAt: new Date(conversation.metadata?.updatedAt || Date.now()),
            lastMessageAt: conversation.metadata?.lastMessageAt
              ? new Date(conversation.metadata.lastMessageAt)
              : undefined,
            status: conversation.metadata?.status || 'active',
            isPinned: conversation.metadata?.isPinned || false,
            tags: conversation.metadata?.tags || [],
            messageCount: conversation.metadata?.messageCount || messages.length,
            tokenCount: conversation.metadata?.tokenCount,
            metadata: conversation.metadata?.custom,
          };

          // Restore messages
          const restoredMessages: Message[] = messages.map((m: any) => ({
            id: m.id,
            conversationId: conversation.id,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.createdAt || Date.now()),
            updatedAt: new Date(m.updatedAt || Date.now()),
            status: 'completed',
            toolCalls: m.toolCalls,
            error: m.error,
            metadata: m.metadata,
          }));

          // Save to persistence
          await this.conversationPersistence.saveConversation(restoredConversation);
          await this.messagePersistence.saveMessages(conversation.id, restoredMessages);

          conversationCount++;
          messageCount += restoredMessages.length;
        } catch (error) {
          errors.push(`Failed to import conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        conversationCount,
        messageCount,
        errors,
      };
    } catch (error) {
      return {
        conversationCount: 0,
        messageCount: 0,
        errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * Generate filename for export
   */
  private getFilename(conversation: Conversation, extension: string): string {
    const title = conversation.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = new Date().toISOString().split('T')[0];
    return `valdi-${title}-${timestamp}.${extension}`;
  }

  /**
   * Download export (browser only)
   */
  async downloadExport(result: ExportResult): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Download is only available in browser environment');
    }

    try {
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy export to clipboard (browser only)
   */
  async copyToClipboard(result: ExportResult): Promise<void> {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      throw new Error('Clipboard API is not available');
    }

    try {
      await navigator.clipboard.writeText(result.data);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Global export service instance
 */
export const exportService = new ExportService();

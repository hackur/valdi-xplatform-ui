/**
 * History Manager
 *
 * Manages conversation history with filtering, search, and export capabilities.
 */

import { Conversation, ConversationUtils } from '@common';
import { ConversationStore } from '@chat_core/ConversationStore';
import { ExportService } from '@chat_core/ExportService';
import {
  ConversationListItemData,
  SearchOptions,
  HistoryFilter,
  ExportOptions,
  ExportFormat,
} from './types';

/**
 * History Manager Class
 *
 * Provides high-level conversation history management.
 * Integrates with ConversationStore and ExportService.
 */
export class HistoryManager {
  private conversationStore: ConversationStore;
  private exportService: ExportService;

  constructor(conversationStore: ConversationStore, exportService: ExportService) {
    this.conversationStore = conversationStore;
    this.exportService = exportService;
  }

  /**
   * Get all conversations as list items
   * @param filter Optional filter
   * @returns Array of conversation list items
   */
  async getConversations(filter?: HistoryFilter): Promise<ConversationListItemData[]> {
    // Get all conversations from store
    const conversations = this.conversationStore.getAllConversations();

    // Apply filters
    let filtered = this.applyFilter(conversations, filter);

    // Sort by updated date (most recent first)
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Convert to list item data
    return filtered.map((conv) => this.toListItem(conv));
  }

  /**
   * Search conversations
   * @param options Search options
   * @returns Matching conversations
   */
  async search(options: SearchOptions): Promise<ConversationListItemData[]> {
    const conversations = this.conversationStore.getAllConversations();

    // Filter by search query
    let results = conversations.filter((conv) => {
      const query = options.query.toLowerCase();

      // Search in title
      if (options.searchIn?.title !== false) {
        if (conv.title?.toLowerCase().includes(query)) {
          return true;
        }
      }

      // Search in metadata (simplified - would need message search in full implementation)
      if (options.searchIn?.metadata) {
        const metadataStr = JSON.stringify(conv.metadata || {}).toLowerCase();
        if (metadataStr.includes(query)) {
          return true;
        }
      }

      return false;
    });

    // Apply date range filter
    if (options.dateRange) {
      results = results.filter((conv) => {
        const convDate = conv.updatedAt;

        if (options.dateRange!.start && convDate < options.dateRange!.start) {
          return false;
        }

        if (options.dateRange!.end && convDate > options.dateRange!.end) {
          return false;
        }

        return true;
      });
    }

    // Apply status filter
    if (options.status && options.status.length > 0) {
      results = results.filter((conv) => options.status!.includes(conv.status));
    }

    // Apply model filter
    if (options.model && options.model.length > 0) {
      results = results.filter((conv) =>
        conv.model ? options.model!.includes(conv.model.modelId) : false,
      );
    }

    // Sort
    const sortField = options.sort?.field || 'updatedAt';
    const sortOrder = options.sort?.order || 'desc';

    results.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'createdAt':
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aVal = a.updatedAt.getTime();
          bVal = b.updatedAt.getTime();
          break;
        case 'title':
          aVal = a.title || '';
          bVal = b.title || '';
          break;
        default:
          aVal = a.updatedAt.getTime();
          bVal = b.updatedAt.getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || results.length;

    results = results.slice(offset, offset + limit);

    // Convert to list items
    return results.map((conv) => this.toListItem(conv));
  }

  /**
   * Get conversation statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    archived: number;
    deleted: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }> {
    const conversations = this.conversationStore.getAllConversations();

    const stats = {
      total: conversations.length,
      active: conversations.filter((c) => c.status === 'active').length,
      archived: conversations.filter((c) => c.status === 'archived').length,
      deleted: conversations.filter((c) => c.status === 'deleted').length,
      totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
      averageMessagesPerConversation: 0,
    };

    if (stats.total > 0) {
      stats.averageMessagesPerConversation = Math.round(
        stats.totalMessages / stats.total,
      );
    }

    return stats;
  }

  /**
   * Export conversations
   * @param conversationIds IDs of conversations to export
   * @param options Export options
   * @returns Exported data as string
   */
  async export(
    conversationIds: string[],
    options: ExportOptions,
  ): Promise<string> {
    const conversations = conversationIds
      .map((id) => this.conversationStore.getConversation(id))
      .filter((c): c is Conversation => c !== undefined);

    if (conversations.length === 0) {
      throw new Error('No conversations to export');
    }

    // Use ExportService for export
    // (Simplified - would need to fetch messages for each conversation)
    switch (options.format) {
      case 'json':
        return JSON.stringify(conversations, null, 2);

      case 'markdown':
        return this.exportToMarkdown(conversations, options);

      case 'txt':
        return this.exportToText(conversations, options);

      case 'html':
        return this.exportToHtml(conversations, options);

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Delete multiple conversations
   */
  async deleteConversations(conversationIds: string[]): Promise<number> {
    let deleted = 0;

    for (const id of conversationIds) {
      try {
        await this.conversationStore.deleteConversation(id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete conversation ${id}:`, error);
      }
    }

    return deleted;
  }

  /**
   * Archive multiple conversations
   */
  async archiveConversations(conversationIds: string[]): Promise<number> {
    let archived = 0;

    for (const id of conversationIds) {
      try {
        await this.conversationStore.updateConversation(id, { status: 'archived' });
        archived++;
      } catch (error) {
        console.error(`Failed to archive conversation ${id}:`, error);
      }
    }

    return archived;
  }

  /**
   * Restore archived conversations
   */
  async restoreConversations(conversationIds: string[]): Promise<number> {
    let restored = 0;

    for (const id of conversationIds) {
      try {
        await this.conversationStore.updateConversation(id, { status: 'active' });
        restored++;
      } catch (error) {
        console.error(`Failed to restore conversation ${id}:`, error);
      }
    }

    return restored;
  }

  /**
   * Apply filter to conversations
   */
  private applyFilter(
    conversations: Conversation[],
    filter?: HistoryFilter,
  ): Conversation[] {
    if (!filter) {
      return conversations;
    }

    let filtered = [...conversations];

    // Date range
    if (filter.dateRange) {
      filtered = filtered.filter((conv) => {
        const convDate = conv.updatedAt;
        return (
          convDate >= filter.dateRange!.start && convDate <= filter.dateRange!.end
        );
      });
    }

    // Models
    if (filter.models && filter.models.length > 0) {
      filtered = filtered.filter((conv) =>
        conv.model ? filter.models!.includes(conv.model.modelId) : false,
      );
    }

    // Statuses
    if (filter.statuses && filter.statuses.length > 0) {
      filtered = filtered.filter((conv) => filter.statuses!.includes(conv.status));
    }

    // Min message count
    if (filter.minMessageCount !== undefined) {
      filtered = filtered.filter((conv) => conv.messageCount >= filter.minMessageCount!);
    }

    return filtered;
  }

  /**
   * Convert conversation to list item
   */
  private toListItem(conversation: Conversation): ConversationListItemData {
    return {
      id: conversation.id,
      title: conversation.title || 'Untitled Conversation',
      lastMessagePreview: conversation.lastMessage?.content
        ? typeof conversation.lastMessage.content === 'string'
          ? conversation.lastMessage.content.substring(0, 100)
          : ''
        : undefined,
      lastMessageTime: conversation.lastMessage?.createdAt,
      unreadCount: 0, // Would need to track this separately
      isPinned: conversation.metadata?.pinned === true,
      status: conversation.status,
      model: conversation.model?.modelId,
      participantCount: conversation.participants?.length || 0,
    };
  }

  /**
   * Export to markdown format
   */
  private exportToMarkdown(
    conversations: Conversation[],
    options: ExportOptions,
  ): string {
    let md = '# Conversation Export\n\n';

    for (const conv of conversations) {
      md += `## ${conv.title || 'Untitled'}\n\n`;

      if (options.includeMetadata) {
        md += `**Created:** ${conv.createdAt.toISOString()}\n`;
        md += `**Updated:** ${conv.updatedAt.toISOString()}\n`;
        md += `**Messages:** ${conv.messageCount}\n`;
        md += `**Model:** ${conv.model?.modelId || 'N/A'}\n\n`;
      }

      md += '---\n\n';
    }

    return md;
  }

  /**
   * Export to text format
   */
  private exportToText(
    conversations: Conversation[],
    options: ExportOptions,
  ): string {
    let txt = 'CONVERSATION EXPORT\n\n';

    for (const conv of conversations) {
      txt += `${conv.title || 'Untitled'}\n`;

      if (options.includeMetadata) {
        txt += `Created: ${conv.createdAt.toISOString()}\n`;
        txt += `Updated: ${conv.updatedAt.toISOString()}\n`;
        txt += `Messages: ${conv.messageCount}\n`;
      }

      txt += '\n---\n\n';
    }

    return txt;
  }

  /**
   * Export to HTML format
   */
  private exportToHtml(
    conversations: Conversation[],
    options: ExportOptions,
  ): string {
    let html = '<html><head><title>Conversation Export</title></head><body>';
    html += '<h1>Conversation Export</h1>';

    for (const conv of conversations) {
      html += `<div class="conversation">`;
      html += `<h2>${conv.title || 'Untitled'}</h2>`;

      if (options.includeMetadata) {
        html += `<div class="metadata">`;
        html += `<p><strong>Created:</strong> ${conv.createdAt.toISOString()}</p>`;
        html += `<p><strong>Updated:</strong> ${conv.updatedAt.toISOString()}</p>`;
        html += `<p><strong>Messages:</strong> ${conv.messageCount}</p>`;
        html += `</div>`;
      }

      html += `</div><hr/>`;
    }

    html += '</body></html>';
    return html;
  }
}

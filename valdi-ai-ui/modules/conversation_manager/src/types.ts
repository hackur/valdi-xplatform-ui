/**
 * Conversation Manager Types
 *
 * Type definitions for conversation management UI and services.
 */

import type { Conversation } from '@common';

/**
 * Conversation List Item Data
 *
 * Optimized data for displaying conversation in a list.
 */
export interface ConversationListItemData {
  /** Conversation ID */
  id: string;

  /** Conversation title */
  title: string;

  /** Last message preview */
  lastMessagePreview?: string;

  /** Last message timestamp */
  lastMessageTime?: Date;

  /** Unread message count */
  unreadCount: number;

  /** Is pinned */
  isPinned: boolean;

  /** Conversation status */
  status: 'active' | 'archived' | 'deleted';

  /** Model being used */
  model?: string;

  /** Participant count */
  participantCount: number;
}

/**
 * Search Options
 */
export interface SearchOptions {
  /** Search query */
  query: string;

  /** Search in */
  searchIn?: {
    title?: boolean;
    messages?: boolean;
    metadata?: boolean;
  };

  /** Date range */
  dateRange?: {
    start?: Date;
    end?: Date;
  };

  /** Filter by status */
  status?: Array<'active' | 'archived' | 'deleted'>;

  /** Filter by model */
  model?: string[];

  /** Sort options */
  sort?: {
    field: 'updatedAt' | 'createdAt' | 'title';
    order: 'asc' | 'desc';
  };

  /** Pagination */
  limit?: number;
  offset?: number;
}

/**
 * History Filter
 */
export interface HistoryFilter {
  /** Date range */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** Filter by model */
  models?: string[];

  /** Filter by status */
  statuses?: Array<'active' | 'archived' | 'deleted'>;

  /** Has attachments */
  hasAttachments?: boolean;

  /** Minimum message count */
  minMessageCount?: number;
}

/**
 * Export Format
 */
export type ExportFormat = 'json' | 'markdown' | 'txt' | 'html';

/**
 * Export Options
 */
export interface ExportOptions {
  /** Format to export to */
  format: ExportFormat;

  /** Include metadata */
  includeMetadata?: boolean;

  /** Include system messages */
  includeSystemMessages?: boolean;

  /** Date range */
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

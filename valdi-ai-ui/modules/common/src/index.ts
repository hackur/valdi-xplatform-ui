/**
 * Common Module - Main Export
 *
 * Exports everything from the common module:
 * - Theme (colors, fonts, spacing, shadows)
 * - Types (Message, Conversation)
 * - Components (Button, Card, Avatar, LoadingSpinner)
 * - Schemas (Zod validation schemas)
 * - Utils (Error handling, network retry, validation)
 */

// Theme exports
export * from './theme';

// Type exports
export * from './types';

// Component exports
export * from './components';

// Error exports
export * from './errors';

// Schema exports
// export * from './schemas'; // TODO: Re-enable when schema dependencies are available

// Utility exports
export * from './utils';

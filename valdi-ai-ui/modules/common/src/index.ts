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

// Theme exports - use explicit /index for Valdi module resolution
export * from './theme/index';

// Type exports
export * from './types/index';

// Component exports
export * from './components/index';

// Error exports
export * from './errors/index';

// TODO: Schema exports
// export * from './schemas/index'; // TODO: Re-enable when schema dependencies are available

// Utility exports
export * from './utils/index';

// Service exports
export * from './services/Logger';

// Navigation types
export type * from './navigation/index';

/**
 * Navigation Types
 *
 * Simple navigation interface for state-based screen navigation.
 * This is a simplified alternative to Valdi's full NavigationController.
 */

/**
 * Screen identifiers for explicit navigation
 */
export type ScreenId = 'home' | 'settings' | 'workflows' | 'conversations' | 'chat';

/**
 * Simple navigation controller interface
 *
 * Used for basic screen-to-screen navigation without the full
 * complexity of Valdi's NavigationController (push/pop/present/dismiss).
 */
export interface SimpleNavigationController {
  /**
   * Navigate back to home screen
   */
  goBack: () => void;

  /**
   * Navigate to a specific screen
   */
  navigateTo: (screen: ScreenId) => void;
}

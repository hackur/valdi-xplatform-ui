/**
 * App - Root Component
 *
 * The root component of the Valdi AI UI application.
 * Sets up navigation and renders the main application structure.
 * Wrapped with error boundary for top-level error handling.
 */

import { Component } from 'valdi_core/src/Component';
import { NavigationRoot } from 'valdi_navigation/src/NavigationController';
import { ErrorBoundary, ErrorScreen } from 'common/src';
import { HomePage } from './HomePage';

/**
 * App Component
 *
 * Root component that initializes the navigation system
 * and renders the home page. Includes top-level error boundary
 * to catch and display any unhandled errors gracefully.
 */
export class App extends Component<Record<string, never>> {
  /**
   * Handle top-level errors
   */
  private handleAppError = (error: Error): void => {
    console.error('Top-level application error:', error);

    // In production, send error to monitoring service
    // e.g., Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // ErrorReportingService.captureException(error);
    }
  };

  override onRender() {
    return (
      <ErrorBoundary
        fallback={(error: Error) => (
          <ErrorScreen
            error={error}
            title="Application Error"
            message="The application encountered an unexpected error. Please try restarting the app."
            showDetails={process.env.NODE_ENV === 'development'}
            showRetryButton={true}
            showGoBackButton={false}
          />
        )}
        onError={this.handleAppError}
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <NavigationRoot>
          {$slot((navigationController) => {
            return <HomePage navigationController={navigationController} />;
          })}
        </NavigationRoot>
      </ErrorBoundary>
    );
  }
}

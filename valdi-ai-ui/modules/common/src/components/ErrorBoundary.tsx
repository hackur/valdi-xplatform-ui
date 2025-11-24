/**
 * ErrorBoundary Component
 *
 * A component that catches and displays errors that occur in child components.
 * Prevents the entire app from crashing when a component throws an error.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error) => <ErrorScreen error={error} />}
 *   onError={(error, errorInfo) => console.error('Error:', error)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors } from '../theme/Colors';
import { Fonts } from '../theme/Fonts';
import { Spacing, BorderRadius } from '../theme';

/**
 * ErrorInfo type for additional error context
 */
export interface ErrorInfo {
  componentStack?: string;
}

/**
 * ViewModel interface for ErrorBoundary component
 */
export interface ErrorBoundaryViewModel {
  /**
   * Custom fallback UI to display when an error occurs
   * Can be a static element or a function that receives the error
   */
  fallback?: ((error: Error, errorInfo?: ErrorInfo) => JSX.Element) | JSX.Element;

  /**
   * Callback when an error is caught
   * @param error - The error that was caught
   * @param errorInfo - Additional error information
   */
  onError?: (error: Error, errorInfo?: ErrorInfo) => void;

  /**
   * Whether to show technical error details in default UI
   * @default false
   */
  showDetails?: boolean;

  /**
   * Custom error title for default UI
   * @default "An error occurred"
   */
  errorTitle?: string;

  /**
   * Whether to log errors to console
   * @default true
   */
  logErrors?: boolean;
}

/**
 * State interface for ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;

  /** The error that was caught */
  error?: Error;

  /** Additional error information */
  errorInfo?: ErrorInfo;

  /** The error message if available */
  errorMessage?: string;

  /** The error stack trace if available */
  errorStack?: string;
}

/**
 * ErrorBoundary Component
 *
 * Catches errors in child components and displays a fallback UI
 * instead of crashing the entire application.
 *
 * Features:
 * - Graceful error handling
 * - Custom fallback UI or default error display
 * - Error callback for logging/reporting
 * - Optional technical error details
 * - Automatic error logging
 */
export class ErrorBoundary extends StatefulComponent<
  ErrorBoundaryViewModel,
  ErrorBoundaryState
> {
  override onCreate() {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorMessage: undefined,
      errorStack: undefined,
    });
  }

  override onRender() {
    const {
      fallback,
      showDetails = false,
      errorTitle = 'An error occurred',
    } = this.viewModel;

    if (this.state && this.state.hasError && this.state.error) {
      // If custom fallback is provided, use it
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(this.state.error, this.state.errorInfo);
        }
        return fallback;
      }

      // Otherwise, render default error UI
      return (
        <view style={styles.errorContainer}>
          <view style={styles.errorCard}>
            {/* Error icon */}
            <label style={styles.errorIcon} value="⚠️" />

            {/* Error title */}
            <label style={styles.errorTitle} value={errorTitle} />

            {/* Error message */}
            <label
              style={styles.errorMessage}
              value={this.state.errorMessage || 'Something went wrong'}
              numberOfLines={0}
            />

            {/* Technical details (if enabled) */}
            {showDetails && this.state.errorStack && (
              <view style={styles.detailsContainer}>
                <label style={styles.detailsTitle} value="Technical Details:" />
                <label
                  style={styles.detailsText}
                  value={this.state.errorStack}
                  numberOfLines={0}
                />
              </view>
            )}

            {/* Help text */}
            <label
              style={styles.helpText}
              value="Try refreshing the page or contact support if the problem persists."
              numberOfLines={0}
            />
          </view>
        </view>
      );
    }

    // Render children normally if no error
    return <slot />;
  }

  /**
   * Called when an error is thrown in a child component
   */
  override onError(error: Error, errorInfo?: ErrorInfo) {
    const { onError, logErrors = true } = this.viewModel;

    // Log error to console if enabled
    if (logErrors) {
      console.error('ErrorBoundary caught an error:', error);
      if (errorInfo?.componentStack) {
        console.error('Component stack:', errorInfo.componentStack);
      }
    }

    // Update state to show error UI
    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack,
    });

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (callbackError) {
        console.error('Error in ErrorBoundary onError callback:', callbackError);
      }
    }
  }

  /**
   * Reset error boundary state
   * Call this to allow user to retry after an error
   */
  public reset(): void {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorMessage: undefined,
      errorStack: undefined,
    });
  }
}

const styles = {
  errorContainer: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  }),

  errorCard: new Style<View>({
    width: '100%',
    maxWidth: 600,
    backgroundColor: Colors.errorLight + '10', // 10% opacity
    borderColor: Colors.error,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
  }),

  errorIcon: new Style<Label>({
    font: Fonts.h1,
    marginBottom: Spacing.base,
  }),

  errorTitle: new Style<Label>({
    font: Fonts.h2,
    color: Colors.error,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  }),

  errorMessage: new Style<Label>({
    font: Fonts.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.base,
    lineHeight: 1.5,
  }),

  detailsContainer: new Style<View>({
    width: '100%',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.sm,
    padding: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
    maxHeight: 200,
    overflow: 'scroll',
  }),

  detailsTitle: new Style<Label>({
    font: Fonts.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  }),

  detailsText: new Style<Label>({
    font: Fonts.code,
    color: Colors.textSecondary,
    fontSize: 11,
  }),

  helpText: new Style<Label>({
    font: Fonts.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.base,
  }),
};

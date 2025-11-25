/**
 * ErrorScreen Component
 *
 * A full-screen error display component for use with ErrorBoundary fallback.
 * Shows a user-friendly error message with optional technical details and actions.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemBoldFont, systemFont } from 'valdi_core/src/SystemFont';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors } from '../theme/Colors';
import { Fonts } from '../theme/Fonts';
import { Spacing, BorderRadius } from '../theme';
import { Button } from './Button';

/**
 * ErrorScreen Props
 */
export interface ErrorScreenProps {
  /**
   * The error object that was caught
   */
  error: Error;

  /**
   * Optional custom error title
   * @default "Something went wrong"
   */
  title?: string;

  /**
   * Optional custom error message
   * If not provided, uses error.message
   */
  message?: string;

  /**
   * Whether to show technical error details (stack trace)
   * @default false
   */
  showDetails?: boolean;

  /**
   * Optional callback when user taps "Try Again"
   */
  onRetry?: () => void;

  /**
   * Optional callback when user taps "Go Back"
   */
  onGoBack?: () => void;

  /**
   * Whether to show the retry button
   * @default true
   */
  showRetryButton?: boolean;

  /**
   * Whether to show the go back button
   * @default true
   */
  showGoBackButton?: boolean;
}

/**
 * ErrorScreen Component
 *
 * Displays a full-screen error UI with:
 * - Error icon
 * - Error title and message
 * - Optional technical details
 * - Action buttons (retry, go back)
 */
export class ErrorScreen extends Component<ErrorScreenProps> {
  private handleRetry = (): void => {
    if (this.viewModel.onRetry) {
      this.viewModel.onRetry();
    } else {
      // Default behavior: reload the page/app
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }
  };

  private handleGoBack = (): void => {
    if (this.viewModel.onGoBack) {
      this.viewModel.onGoBack();
    } else {
      // Default behavior: go back in history
      if (typeof window !== 'undefined' && window.history) {
        window.history.back();
      }
    }
  };

  override onRender() {
    const {
      error,
      title = 'Something went wrong',
      message,
      showDetails = false,
      showRetryButton = true,
      showGoBackButton = true,
    } = this.viewModel;

    const errorMessage = message || error.message || 'An unexpected error occurred';
    const errorStack = error.stack;

    return (
      <view style={styles.container}>
        <view style={styles.content}>
          {/* Error Icon */}
          <view style={styles.iconContainer}>
            <label style={styles.errorIcon} value="⚠️" />
          </view>

          {/* Error Title */}
          <label style={styles.errorTitle} value={title} />

          {/* Error Message */}
          <label style={styles.errorMessage} value={errorMessage} numberOfLines={0} />

          {/* Technical Details (if enabled) */}
          {showDetails && errorStack && (
            <view style={styles.detailsContainer}>
              <label style={styles.detailsTitle} value="Technical Details:" />
              <view style={styles.stackContainer}>
                <label style={styles.stackTrace} value={errorStack} numberOfLines={0} />
              </view>
            </view>
          )}

          {/* Action Buttons */}
          <view style={styles.buttonContainer}>
            {showRetryButton && (
              <Button
                title="Try Again"
                variant="primary"
                size="large"
                onTap={this.handleRetry}
                style={{ flex: 1 }}
              />
            )}
            {showGoBackButton && (
              <Button
                title="Go Back"
                variant="outline"
                size="large"
                onTap={this.handleGoBack}
                style={{ flex: 1 }}
              />
            )}
          </view>

          {/* Help Text */}
          <label
            style={styles.helpText}
            value="If this problem persists, please contact support."
            numberOfLines={0}
          />
        </view>
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  }),

  content: new Style<View>({
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  }),

  iconContainer: new Style<View>({
    width: 80,
    height: 80,
    backgroundColor: Colors.errorLight + '20', // 20% opacity
    borderRadius: BorderRadius.full, // Circular
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  }),

  errorIcon: new Style<Label>({
    font: systemBoldFont(48),
  }),

  errorTitle: new Style<Label>({
    font: systemBoldFont(24),
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.base,
  }),

  errorMessage: new Style<Label>({
    font: systemFont(16),
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 1.5,
  }),

  detailsContainer: new Style<View>({
    width: '100%',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  }),

  detailsTitle: new Style<Label>({
    font: systemBoldFont(14),
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  }),

  stackContainer: new Style<View>({
    width: '100%',
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    maxHeight: 200,
    overflow: 'scroll',
  }),

  stackTrace: new Style<Label>({
    font: systemFont(11),
    color: Colors.textSecondary,
  }),

  buttonContainer: new Style<View>({
    width: '100%',
    flexDirection: 'row',
    marginBottom: Spacing.base,
  }),

  helpText: new Style<Label>({
    font: systemFont(12),
    color: Colors.textTertiary,
    textAlign: 'center',
  }),
};

/**
 * Confirm Dialog Component
 *
 * A reusable confirmation dialog for destructive actions.
 * Provides a consistent UX for user confirmations across the app.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import { Colors, Spacing, SemanticShadows, BorderRadius } from '../theme';

/**
 * Confirm Dialog Props
 */
export interface ConfirmDialogProps {
  /** Dialog title */
  title: string;

  /** Dialog message */
  message: string;

  /** Confirm button text */
  confirmText?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Confirm button color (default: danger) */
  confirmColor?: 'primary' | 'danger';

  /** On confirm callback */
  onConfirm: () => void;

  /** On cancel callback */
  onCancel: () => void;

  /** Is dialog visible */
  isVisible: boolean;
}

/**
 * Confirm Dialog Component
 *
 * A modal dialog for confirming destructive actions.
 */
export class ConfirmDialog extends Component<ConfirmDialogProps> {
  static defaultProps: Partial<ConfirmDialogProps> = {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'danger',
  };

  private handleOverlayTap = (): void => {
    const { onCancel } = this.viewModel;
    if (onCancel) {
      onCancel();
    }
  };

  private handleDialogTap = (): void => {
    // Prevent tap from bubbling to overlay
  };

  private handleConfirm = (): void => {
    const { onConfirm } = this.viewModel;
    if (onConfirm) {
      onConfirm();
    }
  };

  private handleCancel = (): void => {
    const { onCancel } = this.viewModel;
    if (onCancel) {
      onCancel();
    }
  };

  override onRender() {
    const { isVisible, title, message, confirmText, cancelText, confirmColor } =
      this.viewModel;

    if (!isVisible) {
      return null;
    }

    const confirmBackgroundColor =
      confirmColor === 'danger' ? Colors.error : Colors.primary;

    return (
      <view style={styles.overlay} onTap={this.handleOverlayTap}>
        <view style={styles.dialog} onTap={this.handleDialogTap}>
          {/* Title */}
          <label value={title} style={styles.title} />

          {/* Message */}
          <label value={message} style={styles.message} />

          {/* Buttons Container */}
          <view style={styles.buttonsContainer}>
            {/* Cancel Button */}
            <view style={styles.cancelButton} onTap={this.handleCancel}>
              <label
                value={cancelText ?? 'Cancel'}
                style={styles.cancelButtonText}
              />
            </view>

            {/* Confirm Button */}
            <view
              style={
                new Style({
                  ...styles.confirmButton,
                  backgroundColor: confirmBackgroundColor,
                })
              }
              onTap={this.handleConfirm}
            >
              <label
                value={confirmText ?? 'Confirm'}
                style={styles.confirmButtonText}
              />
            </view>
          </view>
        </view>
      </view>
    );
  }
}

const styles = {
  overlay: new Style({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }),

  dialog: new Style({
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '80%',
    maxWidth: 400,
    ...SemanticShadows.modal,
  }),

  title: new Style({
    font: systemBoldFont(20),
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  }),

  message: new Style({
    font: systemFont(16),
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  }),

  buttonsContainer: new Style({
    flexDirection: 'row',
    justifyContent: 'flex-end',
  }),

  cancelButton: new Style({
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  }),

  cancelButtonText: new Style({
    font: systemBoldFont(16),
    color: Colors.textPrimary,
  }),

  confirmButton: new Style({
    borderRadius: BorderRadius.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...SemanticShadows.button,
  }),

  confirmButtonText: new Style({
    font: systemBoldFont(16),
    color: Colors.textInverse,
  }),
};

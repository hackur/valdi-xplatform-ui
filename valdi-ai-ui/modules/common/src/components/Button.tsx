/**
 * Button Component
 *
 * A reusable button component with multiple variants, sizes, and states.
 * Supports primary, secondary, outline, and ghost styles.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemBoldFont } from 'valdi_core/src/SystemFont';
import { Colors, Spacing, SemanticShadows, BorderRadius } from '../theme';

/**
 * Button Variants
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

/**
 * Button Sizes
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button Props
 */
export interface ButtonProps {
  /** Button text */
  title: string;

  /** Visual variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Is button disabled */
  disabled?: boolean;

  /** Is button in loading state */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Icon name (optional) */
  icon?: string;

  /** Icon position */
  iconPosition?: 'left' | 'right';

  /** Tap handler */
  onTap?: () => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * Button Component
 *
 * Reusable button component with comprehensive styling options and accessibility support.
 * Provides multiple variants (primary, secondary, outline, ghost, danger), sizes,
 * disabled and loading states. Follows design system tokens for consistency.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button
 *   title="Submit"
 *   variant="primary"
 *   onTap={() => handleSubmit()}
 * />
 *
 * // Loading state
 * <Button
 *   title="Saving..."
 *   loading={true}
 *   disabled={true}
 * />
 *
 * // Full width outline button
 * <Button
 *   title="Cancel"
 *   variant="outline"
 *   size="large"
 *   fullWidth={true}
 *   onTap={() => handleCancel()}
 * />
 * ```
 */
export class Button extends Component<ButtonProps> {
  static defaultProps: Partial<ButtonProps> = {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    fullWidth: false,
    iconPosition: 'left',
  };

  private getBackgroundColor(): string {
    const { variant, disabled } = this.viewModel;

    if (disabled) {
      return Colors.gray300;
    }

    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'outline':
        return Colors.transparent;
      case 'ghost':
        return Colors.transparent;
      case 'danger':
        return Colors.error;
      case undefined:
      default:
        return Colors.primary;
    }
  }

  private getTextColor(): string {
    const { variant, disabled } = this.viewModel;

    if (disabled === true) {
      return Colors.textTertiary;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return Colors.textInverse;
      case 'outline':
      case 'ghost':
        return Colors.primary;
      case undefined:
      default:
        return Colors.textInverse;
    }
  }

  private getBorderColor(): string {
    const { variant, disabled } = this.viewModel;

    if (disabled === true) {
      return Colors.gray300;
    }

    switch (variant) {
      case 'outline':
        return Colors.primary;
      case 'primary':
      case 'secondary':
      case 'ghost':
      case 'danger':
      case undefined:
      default:
        return Colors.transparent;
    }
  }

  private getPadding(): { paddingLeft: number; paddingRight: number; paddingTop: number; paddingBottom: number } {
    const { size } = this.viewModel;
    switch (size) {
      case 'small':
        return { paddingLeft: Spacing.sm, paddingRight: Spacing.sm, paddingTop: Spacing.xs, paddingBottom: Spacing.xs };
      case 'medium':
        return { paddingLeft: Spacing.base, paddingRight: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.sm };
      case 'large':
        return { paddingLeft: Spacing.lg, paddingRight: Spacing.lg, paddingTop: Spacing.base, paddingBottom: Spacing.base };
      case undefined:
      default:
        return { paddingLeft: Spacing.base, paddingRight: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.sm };
    }
  }

  private getFontSize(): number {
    const { size } = this.viewModel;
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      case undefined:
      default:
        return 16;
    }
  }

  private readonly handleTap = (): void => {
    const { disabled, loading, onTap } = this.viewModel;

    if (!disabled && !loading && onTap) {
      onTap();
    }
  };

  private getContainerStyle(
    backgroundColor: string,
    borderColor: string,
    padding: { paddingLeft: number; paddingRight: number; paddingTop: number; paddingBottom: number },
    fullWidth: boolean | undefined,
    customStyle?: Record<string, unknown>,
  ): Style<View> {
    return new Style<View>({
      ...styles.container,
      backgroundColor,
      ...(borderColor !== Colors.transparent
        ? {
            borderWidth: 2,
            borderColor,
          }
        : {}),
      ...padding,
      width: (fullWidth ?? false) ? '100%' : undefined,
      ...SemanticShadows.button,
      ...customStyle,
    });
  }

  private getLabelStyle(fontSize: number, textColor: string): Style<Label> {
    return new Style<Label>({
      font: systemBoldFont(fontSize),
      color: textColor,
    });
  }

  override onRender() {
    const { title, loading, fullWidth, style: customStyle } = this.viewModel;

    const backgroundColor = this.getBackgroundColor();
    const textColor = this.getTextColor();
    const borderColor = this.getBorderColor();
    const padding = this.getPadding();
    const fontSize = this.getFontSize();

    const containerStyle = this.getContainerStyle(
      backgroundColor,
      borderColor,
      padding,
      fullWidth,
      customStyle,
    );
    const labelStyle = this.getLabelStyle(fontSize, textColor);

    return (
      <view style={containerStyle} onTap={this.handleTap}>
        {loading ? (
          <view style={styles.loadingContainer}>
            <label value="..." style={labelStyle} />
          </view>
        ) : (
          <label value={title} style={labelStyle} />
        )}
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    minHeight: 44, // Minimum touch target size
  }),

  loadingContainer: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }),
};

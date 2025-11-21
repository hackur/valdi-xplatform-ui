/**
 * Button Component
 *
 * A reusable button component with multiple variants, sizes, and states.
 * Supports primary, secondary, outline, and ghost styles.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Fonts, Spacing, SemanticShadows, BorderRadius } from '../theme';

/**
 * Button Variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

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
      default:
        return Colors.primary;
    }
  }

  private getTextColor(): string {
    const { variant, disabled } = this.viewModel;

    if (disabled) {
      return Colors.textTertiary;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return Colors.textInverse;
      case 'outline':
        return Colors.primary;
      case 'ghost':
        return Colors.primary;
      default:
        return Colors.textInverse;
    }
  }

  private getBorderColor(): string {
    const { variant, disabled } = this.viewModel;

    if (disabled) {
      return Colors.gray300;
    }

    switch (variant) {
      case 'outline':
        return Colors.primary;
      default:
        return Colors.transparent;
    }
  }

  private getPadding(): { paddingHorizontal: number; paddingVertical: number } {
    const { size } = this.viewModel;

    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.base,
          paddingVertical: Spacing.sm,
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xxl,
          paddingVertical: Spacing.base,
        };
      default:
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
        };
    }
  }

  private getFontStyle() {
    const { size } = this.viewModel;

    switch (size) {
      case 'small':
        return Fonts.buttonSmall;
      case 'large':
        return Fonts.buttonLarge;
      default:
        return Fonts.button;
    }
  }

  private handleTap = (): void => {
    const { disabled, loading, onTap } = this.viewModel;

    if (!disabled && !loading && onTap) {
      onTap();
    }
  };

  private getContainerStyle(
    backgroundColor: string,
    borderColor: string,
    padding: { paddingHorizontal: number; paddingVertical: number },
    fullWidth: boolean | undefined,
    customStyle?: Record<string, unknown>
  ): Style<View> {
    return new Style<View>({
      ...styles.container,
      backgroundColor,
      borderColor,
      borderWidth: borderColor !== Colors.transparent ? 2 : 0,
      ...padding,
      width: (fullWidth ?? false) ? '100%' : undefined,
      ...SemanticShadows.button,
      ...customStyle,
    });
  }

  onRender() {
    const {
      title,
      loading,
      fullWidth,
      style: customStyle,
    } = this.viewModel;

    const backgroundColor = this.getBackgroundColor();
    const textColor = this.getTextColor();
    const borderColor = this.getBorderColor();
    const padding = this.getPadding();
    const fontStyle = this.getFontStyle();

    const containerStyle = this.getContainerStyle(backgroundColor, borderColor, padding, fullWidth, customStyle);

    return (
      <view
        style={containerStyle}
        onTap={this.handleTap}
      >
        {loading ? (
          <view style={styles.loadingContainer}>
            <label
              value="..."
              style={{
                ...fontStyle,
                color: textColor,
              }}
            />
          </view>
        ) : (
          <label
            value={title}
            style={{
              ...fontStyle,
              color: textColor,
            }}
          />
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

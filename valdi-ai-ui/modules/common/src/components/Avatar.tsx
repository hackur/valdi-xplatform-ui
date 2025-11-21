/**
 * Avatar Component
 *
 * Displays user or AI avatar with customizable size and styling.
 * Supports initials, images, and icon representations.
 */

import { Component, Style, View } from '@valdi/valdi_core';
import { Colors, Fonts, BorderRadius, Shadows } from '../theme';

/**
 * Avatar Size
 */
export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Avatar Type
 */
export type AvatarType = 'user' | 'ai' | 'system';

/**
 * Avatar Props
 */
export interface AvatarProps {
  /** Avatar type */
  type?: AvatarType;

  /** Size of avatar */
  size?: AvatarSize;

  /** User initials (if no image) */
  initials?: string;

  /** Image URL (optional) */
  imageUrl?: string;

  /** Background color (optional) */
  backgroundColor?: string;

  /** Text color */
  textColor?: string;

  /** Show shadow */
  elevated?: boolean;

  /** Tap handler */
  onTap?: () => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * Avatar Component
 */
export class Avatar extends Component<AvatarProps> {
  static defaultProps: Partial<AvatarProps> = {
    type: 'user',
    size: 'medium',
    elevated: false,
  };

  private getSize(): number {
    const { size } = this.props;

    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 40;
      case 'large':
        return 48;
      case 'xlarge':
        return 64;
      default:
        return 40;
    }
  }

  private getBackgroundColor(): string {
    const { type, backgroundColor } = this.props;

    if (backgroundColor) {
      return backgroundColor;
    }

    switch (type) {
      case 'user':
        return Colors.primary;
      case 'ai':
        return Colors.secondary;
      case 'system':
        return Colors.gray500;
      default:
        return Colors.primary;
    }
  }

  private getTextColor(): string {
    const { textColor } = this.props;
    return textColor || Colors.textInverse;
  }

  private getInitials(): string {
    const { type, initials } = this.props;

    if (initials) {
      return initials.substring(0, 2).toUpperCase();
    }

    switch (type) {
      case 'user':
        return 'U';
      case 'ai':
        return 'AI';
      case 'system':
        return 'S';
      default:
        return 'U';
    }
  }

  private getFontSize(): number {
    const { size } = this.props;

    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      case 'xlarge':
        return 24;
      default:
        return 16;
    }
  }

  private handleTap = (): void => {
    const { onTap } = this.props;
    if (onTap) {
      onTap();
    }
  };

  onRender() {
    const { imageUrl, elevated, onTap, style: customStyle } = this.props;

    const size = this.getSize();
    const backgroundColor = this.getBackgroundColor();
    const textColor = this.getTextColor();
    const initials = this.getInitials();
    const fontSize = this.getFontSize();

    return (
      <view
        style={{
          ...styles.container,
          width: size,
          height: size,
          backgroundColor,
          ...(elevated ? Shadows.sm : {}),
          ...customStyle,
        }}
        onTap={onTap ? this.handleTap : undefined}
      >
        {imageUrl ? (
          <image
            src={imageUrl}
            style={{
              width: size,
              height: size,
              borderRadius: BorderRadius.full,
            }}
          />
        ) : (
          <label
            value={initials}
            style={{
              ...Fonts.bodySemibold,
              fontSize,
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
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }),
};

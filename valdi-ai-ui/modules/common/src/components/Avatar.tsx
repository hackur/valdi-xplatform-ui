/**
 * Avatar Component
 *
 * Displays user or AI avatar with customizable size and styling.
 * Supports initials, images, and icon representations.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { systemBoldFont } from 'valdi_core/src/SystemFont';
import { Colors, Shadows } from '../theme';

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
    const { size } = this.viewModel;
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
    const { type, backgroundColor } = this.viewModel;

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
    const { textColor } = this.viewModel;
    return textColor || Colors.textInverse;
  }

  private getInitials(): string {
    const { type, initials } = this.viewModel;

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
    const { size } = this.viewModel;
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
    const { onTap } = this.viewModel;
    if (onTap) {
      onTap();
    }
  };

  private getContainerStyle(
    size: number,
    backgroundColor: string,
    elevated: boolean | undefined,
    customStyle?: Record<string, unknown>,
  ): Style<View> {
    return new Style({
      ...styles.container,
      width: size,
      height: size,
      backgroundColor: backgroundColor,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      ...(elevated ? Shadows.sm : {}),
      ...customStyle,
    });
  }

  private getImageStyle(size: number): Style<View> {
    return new Style({
      width: size,
      height: size,
      borderRadius: size / 2,
    });
  }

  private getLabelStyle(fontSize: number, textColor: string): Style<Label> {
    return new Style({
      font: systemBoldFont(fontSize),
      color: textColor,
    });
  }

  override onRender() {
    const { imageUrl, elevated, onTap, style: customStyle } = this.viewModel;

    const size = this.getSize();
    const backgroundColor = this.getBackgroundColor();
    const textColor = this.getTextColor();
    const initials = this.getInitials();
    const fontSize = this.getFontSize();

    const containerStyle = this.getContainerStyle(
      size,
      backgroundColor,
      elevated,
      customStyle,
    );
    const imageStyle = this.getImageStyle(size);
    const labelStyle = this.getLabelStyle(fontSize, textColor);

    return (
      <view style={containerStyle} onTap={onTap ? this.handleTap : undefined}>
        {imageUrl ? (
          <image src={imageUrl} style={imageStyle} />
        ) : (
          <label value={initials} style={labelStyle} />
        )}
      </view>
    );
  }
}

const styles = {
  container: new Style({
    // Note: overflow property not supported in Valdi Style
  }),
};

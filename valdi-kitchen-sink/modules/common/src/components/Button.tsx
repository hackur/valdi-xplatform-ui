/**
 * Button Component
 * Reusable button with multiple variants and states
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors } from '../theme/colors';
import { Fonts, FontSizes } from '../theme/fonts';
import { BorderRadius, Spacing } from '../theme/styles';

export interface ButtonViewModel {
  /** Button text */
  title: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** On tap callback */
  onTap?: () => void;
}

export class Button extends Component<ButtonViewModel> {
  onRender() {
    const {
      title,
      variant = 'primary',
      size = 'medium',
      disabled = false,
      fullWidth = false,
      onTap,
    } = this.viewModel;

    // Determine styles based on variant and size
    const containerStyle = this.getContainerStyle(variant, size, fullWidth, disabled);
    const textStyle = this.getTextStyle(variant, size, disabled);

    <view
      style={containerStyle}
      onTap={disabled ? undefined : onTap}
      onTapDisabled={disabled}
    >
      <label style={textStyle} value={title} />
    </view>;
  }

  private getContainerStyle(
    variant: ButtonViewModel['variant'],
    size: ButtonViewModel['size'],
    fullWidth: boolean,
    disabled: boolean
  ): Style<View> {
    let backgroundColor = Colors.primary;
    let borderColor = 'transparent';
    let borderWidth = 0;
    let opacity = disabled ? 0.5 : 1;

    switch (variant) {
      case 'primary':
        backgroundColor = Colors.primary;
        break;
      case 'secondary':
        backgroundColor = Colors.secondary;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        borderColor = Colors.primary;
        borderWidth = 2;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        break;
    }

    let paddingVertical = Spacing.md;
    let paddingHorizontal = Spacing.lg;

    switch (size) {
      case 'small':
        paddingVertical = Spacing.sm;
        paddingHorizontal = Spacing.base;
        break;
      case 'medium':
        paddingVertical = Spacing.md;
        paddingHorizontal = Spacing.lg;
        break;
      case 'large':
        paddingVertical = Spacing.base;
        paddingHorizontal = Spacing.xl;
        break;
    }

    return new Style<View>({
      backgroundColor,
      borderRadius: BorderRadius.base,
      paddingTop: paddingVertical,
      paddingBottom: paddingVertical,
      paddingLeft: paddingHorizontal,
      paddingRight: paddingHorizontal,
      borderWidth,
      borderColor,
      opacity,
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
    });
  }

  private getTextStyle(
    variant: ButtonViewModel['variant'],
    size: ButtonViewModel['size'],
    disabled: boolean
  ): Style<Label> {
    let color = Colors.white;

    switch (variant) {
      case 'primary':
      case 'secondary':
        color = Colors.white;
        break;
      case 'outline':
      case 'ghost':
        color = Colors.primary;
        break;
    }

    let fontSize = FontSizes.base;
    switch (size) {
      case 'small':
        fontSize = FontSizes.sm;
        break;
      case 'medium':
        fontSize = FontSizes.base;
        break;
      case 'large':
        fontSize = FontSizes.lg;
        break;
    }

    return new Style<Label>({
      color,
      font: Fonts.button,
      textAlign: 'center',
    });
  }
}

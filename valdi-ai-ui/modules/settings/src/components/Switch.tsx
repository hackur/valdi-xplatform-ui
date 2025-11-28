/**
 * Switch Component
 *
 * A toggle switch component for boolean settings.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, BorderRadius } from 'common/src';

/**
 * Switch Props
 */
export interface SwitchProps {
  /** Current value */
  value: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Value change handler */
  onValueChange?: (value: boolean) => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * Switch Component
 */
export class Switch extends Component<SwitchProps> {
  static defaultProps: Partial<SwitchProps> = {
    value: false,
    disabled: false,
  };

  private handleToggle = (): void => {
    const { disabled, value, onValueChange } = this.viewModel;

    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  private getTrackStyle(value: boolean, disabled: boolean, customStyle?: Record<string, unknown>) {
    const trackColor = value
      ? disabled
        ? Colors.primaryLight
        : Colors.primary
      : disabled
        ? Colors.gray300
        : Colors.gray400;

    return new Style<View>({
      ...styles.track,
      backgroundColor: trackColor,
      opacity: disabled ? 0.5 : 1,
      ...customStyle,
    });
  }

  private getThumbStyle(value: boolean) {
    return new Style<View>({
      ...styles.thumb,
      marginLeft: value ? 20 : 0,
    });
  }

  override onRender() {
    const { value, disabled, style: customStyle } = this.viewModel;

    return (
      <view
        style={this.getTrackStyle(value, disabled || false, customStyle)}
        onTap={this.handleToggle}
      >
        <view
          style={this.getThumbStyle(value)}
        />
      </view>
    );
  }
}

const styles = {
  track: new Style<View>({
    width: 48,
    height: 28,
    borderRadius: BorderRadius.full,
    padding: 2,
    justifyContent: 'center',
  }),

  thumb: new Style<View>({
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textInverse,
  }),
};

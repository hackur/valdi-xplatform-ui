/**
 * Switch Component
 *
 * A toggle switch component for boolean settings.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, BorderRadius } from '@common';

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

  onRender() {
    const { value, disabled, style: customStyle } = this.viewModel;

    const trackColor = value
      ? disabled
        ? Colors.primaryLight
        : Colors.primary
      : disabled
        ? Colors.gray300
        : Colors.gray400;

    const thumbTranslateX = value ? 20 : 0;

    return (
      <view
        style={{
          ...styles.track,
          backgroundColor: trackColor,
          opacity: disabled ? 0.5 : 1,
          ...customStyle,
        }}
        onTap={this.handleToggle}
      >
        <view
          style={{
            ...styles.thumb,
            transform: `translateX(${thumbTranslateX}px)`,
          }}
        />
      </view>
    );
  }
}

const styles = {
  track: new Style<View>({
    width: 48,
    height: 28,
    borderRadius: BorderRadius.round,
    padding: 2,
    justifyContent: 'center',
  }),

  thumb: new Style<View>({
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  }),
};

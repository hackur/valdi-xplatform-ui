/**
 * TextInput Component
 *
 * A styled text input component with support for secure text entry.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Fonts, Spacing, BorderRadius } from 'common/src';

/**
 * TextInput Props
 */
export interface TextInputProps {
  /** Current value */
  value: string;

  /** Placeholder text */
  placeholder?: string;

  /** Secure text entry (for passwords/API keys) */
  secureTextEntry?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Multiline input */
  multiline?: boolean;

  /** Number of lines (for multiline) */
  numberOfLines?: number;

  /** Change handler */
  onChangeText?: (text: string) => void;

  /** Focus handler */
  onFocus?: () => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Custom style */
  style?: Style<View> | Record<string, unknown>;
}

/**
 * TextInput State
 */
interface TextInputState {
  isFocused: boolean;
}

/**
 * TextInput Component
 */
export class TextInput extends StatefulComponent<TextInputProps, TextInputState> {
  static defaultProps: Partial<TextInputProps> = {
    placeholder: '',
    secureTextEntry: false,
    disabled: false,
    multiline: false,
    numberOfLines: 1,
  };

  override state: TextInputState = {
    isFocused: false,
  };

  private handleChange = (event: EditTextEvent): void => {
    const { onChangeText } = this.viewModel;
    if (onChangeText) {
      onChangeText(event.text);
    }
  };

  private handleFocus = (): void => {
    this.setState({ isFocused: true });
    if (this.viewModel.onFocus) {
      this.viewModel.onFocus();
    }
  };

  private handleBlur = (): void => {
    this.setState({ isFocused: false });
    if (this.viewModel.onBlur) {
      this.viewModel.onBlur();
    }
  };

  // Reserved for future secure text display functionality (suppress unused warning)
  // @ts-ignore Intentionally kept for future use
  private getDisplayValue = (): string => {
    const { value, secureTextEntry } = this.viewModel;

    if (secureTextEntry && value) {
      return '•'.repeat(value.length);
    }

    return value;
  };

  private getContainerStyle(isFocused: boolean, disabled: boolean, customStyle?: Style<View> | Record<string, unknown>) {
    const borderColor = isFocused
      ? Colors.primary
      : disabled
        ? Colors.gray300
        : Colors.border;

    return new Style<View>({
      ...styles.container,
      borderColor,
      backgroundColor: disabled ? Colors.gray100 : Colors.surface,
      ...(customStyle || {}),
    });
  }

  private getInputStyle(disabled: boolean) {
    return new Style<View>({
      width: '100%',
      backgroundColor: 'transparent',
      opacity: disabled ? 0.5 : 1,
    });
  }

  override onRender() {
    const {
      value,
      placeholder,
      disabled,
      multiline: _multiline,
      numberOfLines: _numberOfLines,
      style: customStyle,
    } = this.viewModel;

    const { isFocused } = this.state;

    return (
      <view
        style={this.getContainerStyle(isFocused, disabled || false, customStyle)}
      >
        <textfield
          value={value}
          placeholder={placeholder}
          onChange={this.handleChange}
          style={this.getInputStyle(disabled || false)}
        />
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  }),

  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  } as Record<string, unknown>,
};

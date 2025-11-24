/**
 * TextInput Component
 *
 * A styled text input component with support for secure text entry.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Colors, Fonts, Spacing, BorderRadius } from '@common';

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
  style?: Record<string, unknown>;
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
export class TextInput extends Component<TextInputProps, TextInputState> {
  static defaultProps: Partial<TextInputProps> = {
    placeholder: '',
    secureTextEntry: false,
    disabled: false,
    multiline: false,
    numberOfLines: 1,
  };

  constructor(props: TextInputProps) {
    super(props);
    this.state = {
      isFocused: false,
    };
  }

  private handleChange = (event: any): void => {
    const { onChangeText } = this.viewModel;
    if (onChangeText) {
      const value = event.target?.value || '';
      onChangeText(value);
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

  private getDisplayValue = (): string => {
    const { value, secureTextEntry } = this.viewModel;

    if (secureTextEntry && value) {
      return '•'.repeat(value.length);
    }

    return value;
  };

  override onRender() {
    const {
      value,
      placeholder,
      disabled,
      multiline,
      numberOfLines,
      style: customStyle,
    } = this.viewModel;

    const { isFocused } = this.state;

    const borderColor = isFocused
      ? Colors.primary
      : disabled
        ? Colors.gray300
        : Colors.border;

    return (
      <view
        style={{
          ...styles.container,
          borderColor,
          backgroundColor: disabled ? Colors.gray100 : Colors.surface,
          ...customStyle,
        }}
      >
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          style={{
            ...styles.input,
            ...Fonts.body,
            color: disabled ? Colors.textTertiary : Colors.textPrimary,
            minHeight: multiline ? numberOfLines! * 24 : undefined,
          }}
        />
      </view>
    );
  }
}

const styles = {
  container: new Style({
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  }),

  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  } as Record<string, unknown>,
};

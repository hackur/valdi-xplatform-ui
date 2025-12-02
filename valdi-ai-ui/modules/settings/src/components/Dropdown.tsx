/**
 * Dropdown Component
 *
 * A dropdown/select component for choosing from a list of options.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Fonts, Spacing, BorderRadius } from '../../../common/src/index';

/**
 * Dropdown Option
 */
export interface DropdownOption {
  label: string;
  value: string;
}

/**
 * Dropdown Props
 */
export interface DropdownProps {
  /** Available options */
  options: DropdownOption[];

  /** Currently selected value */
  selectedValue: string;

  /** Disabled state */
  disabled?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Value change handler */
  onValueChange?: (value: string) => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * Dropdown State
 */
interface DropdownState {
  isOpen: boolean;
}

/**
 * Dropdown Component
 */
export class Dropdown extends StatefulComponent<DropdownProps, DropdownState> {
  static defaultProps: Partial<DropdownProps> = {
    disabled: false,
    placeholder: 'Select an option',
  };

  // Cache handlers for option selection (per Valdi best practices)
  private readonly optionSelectHandlers = new Map<string, () => void>();

  override state: DropdownState = {
    isOpen: false,
  };

  private readonly toggleDropdown = (): void => {
    if (!this.viewModel.disabled) {
      this.setState({ isOpen: !this.state.isOpen });
    }
  };

  private readonly handleSelect = (value: string): void => {
    const { onValueChange } = this.viewModel;

    this.setState({ isOpen: false });

    if (onValueChange) {
      onValueChange(value);
    }
  };

  // Cached handler getter (per Valdi best practices)
  private getOptionSelectHandler(value: string): () => void {
    let handler = this.optionSelectHandlers.get(value);
    if (!handler) {
      handler = () => { this.handleSelect(value); };
      this.optionSelectHandlers.set(value, handler);
    }
    return handler;
  }

  private readonly getSelectedLabel = (): string => {
    const { options, selectedValue, placeholder } = this.viewModel;

    const selected = options.find((opt) => opt.value === selectedValue);
    return selected ? selected.label : placeholder || '';
  };

  private getContainerStyle(customStyle?: Record<string, unknown>) {
    return new Style<View>({
      position: 'relative',
      ...(customStyle || {}),
    });
  }

  private getSelectorStyle(disabled: boolean, isOpen: boolean) {
    return new Style<View>({
      ...styles.selector,
      backgroundColor: disabled ? Colors.gray100 : Colors.surface,
      borderColor: isOpen ? Colors.primary : Colors.border,
      opacity: disabled ? 0.5 : 1,
    });
  }

  private getSelectorLabelStyle(disabled: boolean) {
    return new Style<Label>({
      ...Fonts.body,
      color: disabled ? Colors.textTertiary : Colors.textPrimary,
    });
  }

  private getArrowLabelStyle(disabled: boolean) {
    return new Style<Label>({
      ...Fonts.caption,
      color: disabled ? Colors.textTertiary : Colors.textSecondary,
    });
  }

  private getOptionStyle(isSelected: boolean) {
    return new Style<View>({
      ...styles.option,
      backgroundColor: isSelected ? Colors.primaryLighter : Colors.surface,
    });
  }

  private getOptionLabelStyle(isSelected: boolean) {
    return new Style<Label>({
      ...Fonts.body,
      color: isSelected ? Colors.primary : Colors.textPrimary,
    });
  }

  override onRender() {
    const {
      options,
      selectedValue,
      disabled,
      style: customStyle,
    } = this.viewModel;
    const { isOpen } = this.state;

    return (
      <view style={this.getContainerStyle(customStyle)}>
        {/* Selected Value Display */}
        <view
          style={this.getSelectorStyle(disabled || false, isOpen)}
          onTap={this.toggleDropdown}
        >
          <label
            value={this.getSelectedLabel()}
            style={this.getSelectorLabelStyle(disabled || false)}
          />

          {/* Dropdown Arrow */}
          <label
            value={isOpen ? '▲' : '▼'}
            style={this.getArrowLabelStyle(disabled || false)}
          />
        </view>

        {/* Dropdown Options */}
        {isOpen && (
          <view style={styles.optionsList}>
            {options.map((option) => (
              <view
                style={this.getOptionStyle(option.value === selectedValue)}
                onTap={this.getOptionSelectHandler(option.value)}
              >
                <label
                  value={option.label}
                  style={this.getOptionLabelStyle(option.value === selectedValue)}
                />
              </view>
            ))}
          </view>
        )}
      </view>
    );
  }
}

const styles = {
  selector: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    minHeight: 44,
  }),

  optionsList: new Style<View>({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xxs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    zIndex: 1000,
    maxHeight: 200,
    overflow: 'scroll',
  }),

  option: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  }),
};

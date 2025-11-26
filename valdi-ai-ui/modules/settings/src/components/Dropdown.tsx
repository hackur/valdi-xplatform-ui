/**
 * Dropdown Component
 *
 * A dropdown/select component for choosing from a list of options.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Colors, Fonts, Spacing, BorderRadius } from 'common/src';

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
export class Dropdown extends Component<DropdownProps, DropdownState> {
  static defaultProps: Partial<DropdownProps> = {
    disabled: false,
    placeholder: 'Select an option',
  };

  constructor(props: DropdownProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  private toggleDropdown = (): void => {
    if (!this.viewModel.disabled) {
      this.setState({ isOpen: !this.state.isOpen });
    }
  };

  private handleSelect = (value: string): void => {
    const { onValueChange } = this.viewModel;

    this.setState({ isOpen: false });

    if (onValueChange) {
      onValueChange(value);
    }
  };

  private getSelectedLabel = (): string => {
    const { options, selectedValue, placeholder } = this.viewModel;

    const selected = options.find((opt) => opt.value === selectedValue);
    return selected ? selected.label : placeholder || '';
  };

  override onRender() {
    const {
      options,
      selectedValue,
      disabled,
      style: customStyle,
    } = this.viewModel;
    const { isOpen } = this.state;

    return (
      <view style={{ position: 'relative', ...customStyle }}>
        {/* Selected Value Display */}
        <view
          style={{
            ...styles.selector,
            backgroundColor: disabled ? Colors.gray100 : Colors.surface,
            borderColor: isOpen ? Colors.primary : Colors.border,
            opacity: disabled ? 0.5 : 1,
          }}
          onTap={this.toggleDropdown}
        >
          <label
            value={this.getSelectedLabel()}
            style={{
              ...Fonts.body,
              color: disabled ? Colors.textTertiary : Colors.textPrimary,
            }}
          />

          {/* Dropdown Arrow */}
          <label
            value={isOpen ? '▲' : '▼'}
            style={{
              ...Fonts.caption,
              color: disabled ? Colors.textTertiary : Colors.textSecondary,
            }}
          />
        </view>

        {/* Dropdown Options */}
        {isOpen && (
          <view style={styles.optionsList}>
            {options.map((option) => (
              <view
                key={option.value}
                style={{
                  ...styles.option,
                  backgroundColor:
                    option.value === selectedValue
                      ? Colors.primaryLighter
                      : Colors.surface,
                }}
                onTap={() => this.handleSelect(option.value)}
              >
                <label
                  value={option.label}
                  style={{
                    ...Fonts.body,
                    color:
                      option.value === selectedValue
                        ? Colors.primary
                        : Colors.textPrimary,
                  }}
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
  selector: new Style({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    minHeight: 44,
  }),

  optionsList: new Style({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xxs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
    maxHeight: 200,
    overflow: 'auto',
  }),

  option: new Style({
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  }),
};

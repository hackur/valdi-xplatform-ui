/**
 * SearchBar Component
 *
 * Search bar for filtering conversations.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label, TextInput } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Fonts, Spacing, Shadows } from '@common';

/**
 * SearchBar Props
 */
export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;

  /** On search handler */
  onSearch?: (query: string) => void;

  /** On clear handler */
  onClear?: () => void;

  /** Debounce delay in ms */
  debounceMs?: number;
}

/**
 * SearchBar State
 */
export interface SearchBarState {
  /** Current search query */
  query: string;

  /** Is active (focused) */
  isActive: boolean;
}

/**
 * SearchBar Component
 *
 * Text input with search icon and clear button.
 */
export class SearchBar extends StatefulComponent<
  SearchBarProps,
  SearchBarState
> {
  private debounceTimer?: NodeJS.Timeout;

  state: SearchBarState = {
    query: '',
    isActive: false,
  };

  onRender() {
    const { placeholder = 'Search conversations...' } = this.props;
    const { query, isActive } = this.state;

    return (
      <view style={isActive ? styles.containerActive : styles.container}>
        {/* Search Icon */}
        <label value="🔍" style={styles.searchIcon} />

        {/* Text Input */}
        <textInput
          value={query}
          placeholder={placeholder}
          onChangeText={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          style={styles.input}
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Clear Button */}
        {query.length > 0 && (
          <view style={styles.clearButton} onTap={this.handleClear}>
            <label value="✕" style={styles.clearIcon} />
          </view>
        )}
      </view>
    );
  }

  /**
   * Handle text change
   */
  private handleChange = (text: string): void => {
    this.setState({ query: text });

    // Debounce search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const debounceMs = this.props.debounceMs || 300;

    this.debounceTimer = setTimeout(() => {
      if (this.props.onSearch) {
        this.props.onSearch(text);
      }
    }, debounceMs);
  };

  /**
   * Handle focus
   */
  private handleFocus = (): void => {
    this.setState({ isActive: true });
  };

  /**
   * Handle blur
   */
  private handleBlur = (): void => {
    this.setState({ isActive: false });
  };

  /**
   * Handle clear
   */
  private handleClear = (): void => {
    this.setState({ query: '' });

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (this.props.onClear) {
      this.props.onClear();
    }

    if (this.props.onSearch) {
      this.props.onSearch('');
    }
  };

  /**
   * Cleanup on unmount
   */
  componentWillUnmount(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

const styles = {
  container: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
  }),

  containerActive: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  }),

  searchIcon: new Style<Label>({
    fontSize: 18,
    marginRight: Spacing.sm,
    color: Colors.textTertiary,
  }),

  input: new Style<TextInput>({
    flex: 1,
    ...Fonts.bodyRegular,
    color: Colors.textPrimary,
    padding: 0,
  }),

  clearButton: new Style<View>({
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  }),

  clearIcon: new Style<Label>({
    fontSize: 14,
    color: Colors.textSecondary,
  }),
};

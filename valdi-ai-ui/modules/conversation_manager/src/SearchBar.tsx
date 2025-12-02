/**
 * SearchBar Component
 *
 * Search bar for filtering conversations.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, Label, EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';
import { systemFont } from 'valdi_core/src/SystemFont';
import { Colors, Fonts, Spacing, BorderRadius, SemanticShadows } from '../../common/src/index';

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
  private debounceTimer?: ReturnType<typeof setTimeout>;

  override state: SearchBarState = {
    query: '',
    isActive: false,
  };

  override onRender() {
    const { placeholder = 'Search conversations...' } = this.viewModel;
    const { query, isActive } = this.state;

    return (
      <view style={isActive ? styles.containerActive : styles.container}>
        {/* Search Icon */}
        <label value="🔍" style={styles.searchIcon} />

        {/* Text Input */}
        <textfield
          value={query}
          placeholder={placeholder}
          onChange={this.handleChange}
          style={styles.input}
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
  private readonly handleChange = (event: EditTextEvent): void => {
    const {text} = event;
    this.setState({ query: text });

    // Debounce search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const debounceMs = this.viewModel.debounceMs || 300;

    this.debounceTimer = setTimeout(() => {
      if (this.viewModel.onSearch) {
        this.viewModel.onSearch(text);
      }
    }, debounceMs);
  };

  /**
   * Handle focus
   */
  private readonly handleFocus = (): void => {
    this.setState({ isActive: true });
  };

  /**
   * Handle blur
   */
  private readonly handleBlur = (): void => {
    this.setState({ isActive: false });
  };

  /**
   * Handle clear
   */
  private readonly handleClear = (): void => {
    this.setState({ query: '' });

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (this.viewModel.onClear) {
      this.viewModel.onClear();
    }

    if (this.viewModel.onSearch) {
      this.viewModel.onSearch('');
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.base,
  }),

  containerActive: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.base,
    ...SemanticShadows.card,
  }),

  searchIcon: new Style<Label>({
    font: systemFont(18),
    marginRight: Spacing.sm,
    color: Colors.textTertiary,
  }),

  input: new Style<View>({
    flexGrow: 1,
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
    font: systemFont(14),
    color: Colors.textSecondary,
  }),
};

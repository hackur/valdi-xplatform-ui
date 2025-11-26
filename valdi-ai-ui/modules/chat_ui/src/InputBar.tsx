/**
 * InputBar
 *
 * Message input component with send button.
 * Handles user text input and message sending.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  ChatBorderRadius,
  SemanticShadows,
  Button,
} from 'common/src';

/**
 * InputBar Props
 */
export interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * InputBar State
 */
interface InputBarState {
  text: string;
}

/**
 * InputBar Component
 */
export class InputBar extends StatefulComponent<InputBarProps, InputBarState> {
  static defaultProps: Partial<InputBarProps> = {
    disabled: false,
    placeholder: 'Type a message...',
  };

  override state: InputBarState = {
    text: '',
  };

  private handleTextChange = (text: string): void => {
    this.setState({ text });
  };

  private handleSend = (): void => {
    const { text } = this.state;
    const { onSend, disabled } = this.viewModel;

    if (!text.trim() || disabled) {
      return;
    }

    onSend(text.trim());
    this.setState({ text: '' });
  };

  override onRender() {
    const { disabled, placeholder } = this.viewModel;
    const { text } = this.state;

    const canSend = text.trim().length > 0 && !disabled;

    return (
      <view style={styles.container}>
        <view style={styles.inputContainer}>
          {/* Text Input */}
          <textfield
            value={text}
            placeholder={placeholder}
            onValueChange={this.handleTextChange}
            multiline={true}
            style={{
              ...styles.input,
              ...Fonts.body,
              color: Colors.textPrimary,
            }}
            disabled={disabled}
          />

          {/* Send Button */}
          <view style={styles.sendButtonContainer}>
            <Button
              title="Send"
              variant="primary"
              size="small"
              disabled={!canSend}
              onTap={this.handleSend}
            />
          </view>
        </view>
      </view>
    );
  }
}

const styles = {
  container: new Style({
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: SemanticSpacing.inputBarPadding,
    paddingVertical: Spacing.md,
    ...SemanticShadows.inputBar,
  }),

  inputContainer: new Style({
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  }),

  input: new Style({
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: ChatBorderRadius.inputBar,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  sendButtonContainer: new Style({
    marginBottom: Spacing.xs,
  }),
};

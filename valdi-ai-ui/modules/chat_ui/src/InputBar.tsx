/**
 * InputBar
 *
 * Message input component with send button.
 * Handles user text input and message sending.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';
import {
  Colors,
  Fonts,
  Spacing,
  SemanticSpacing,
  ChatBorderRadius,
  SemanticShadows,
  Button,
} from '../../common/src/index';

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

  private readonly handleTextChange = (event: EditTextEvent): void => {
    this.setState({ text: event.text });
  };

  private readonly handleSend = (): void => {
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
            onChange={this.handleTextChange}
            style={styles.input}
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
  container: new Style<View>({
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: SemanticSpacing.inputBarPadding,
    paddingRight: SemanticSpacing.inputBarPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    ...SemanticShadows.inputBar,
  }),

  inputContainer: new Style<View>({
    flexDirection: 'row',
    alignItems: 'flex-end',
  }),

  input: new Style<View>({
    flexGrow: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: ChatBorderRadius.inputBar,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  sendButtonContainer: new Style<View>({
    marginBottom: Spacing.xs,
  }),
};

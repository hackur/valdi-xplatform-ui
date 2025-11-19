/**
 * CodeBlock Component
 * Display code snippets with syntax highlighting (simulated with styling)
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { BorderRadius, Spacing } from '../theme/styles';

export interface CodeBlockViewModel {
  /** Code content */
  code: string;
  /** Language (for display only) */
  language?: string;
}

export class CodeBlock extends Component<CodeBlockViewModel> {
  onRender() {
    const { code, language } = this.viewModel;

    <view style={styles.container}>
      {/* Language label */}
      {language && <label style={styles.language} value={language.toUpperCase()} />}

      {/* Code content */}
      <label style={styles.code} value={code} numberOfLines={0} />
    </view>;
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
    backgroundColor: Colors.gray800,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
  }),

  language: new Style<Label>({
    font: Fonts.captionSmall,
    color: Colors.gray400,
    marginBottom: Spacing.xs,
  }),

  code: new Style<Label>({
    font: Fonts.code,
    color: Colors.gray100,
  }),
};

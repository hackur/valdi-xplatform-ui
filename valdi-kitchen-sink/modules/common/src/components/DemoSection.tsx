/**
 * DemoSection Component
 * Section wrapper for organizing demo content with title and description
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Layout, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { Slot } from 'valdi_tsx/src/SlotElements';

import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { Spacing } from '../theme/styles';

export interface DemoSectionViewModel {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Spacing between content and next section */
  marginBottom?: number;
}

export class DemoSection extends Component<DemoSectionViewModel> {
  onRender() {
    const { title, description, marginBottom = Spacing.xl } = this.viewModel;

    <layout width="100%" marginBottom={marginBottom}>
      {/* Section header */}
      <layout style={styles.header}>
        <label style={styles.title} value={title} />
        {description && (
          <label style={styles.description} value={description} numberOfLines={0} />
        )}
      </layout>

      {/* Section content */}
      <layout style={styles.content}>
        <Slot />
      </layout>
    </layout>;
  }
}

const styles = {
  header: new Style<Layout>({
    width: '100%',
    marginBottom: Spacing.md,
  }),

  title: new Style<Label>({
    font: Fonts.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  }),

  description: new Style<Label>({
    font: Fonts.body,
    color: Colors.textSecondary,
  }),

  content: new Style<Layout>({
    width: '100%',
  }),
};

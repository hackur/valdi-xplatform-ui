/**
 * Header Component
 * Page header with title and optional back button
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Label, Layout } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { Spacing } from '../theme/styles';

export interface HeaderViewModel {
  /** Header title */
  title: string;
  /** Show back button */
  showBack?: boolean;
  /** Back button callback */
  onBack?: () => void;
  /** Background color */
  backgroundColor?: string;
}

export class Header extends Component<HeaderViewModel> {
  onRender() {
    const {
      title,
      showBack = false,
      onBack,
      backgroundColor = Colors.surface,
    } = this.viewModel;

    <view style={styles.container} backgroundColor={backgroundColor}>
      <layout style={styles.content}>
        {/* Back button */}
        {showBack && (
          <view style={styles.backButton} onTap={onBack}>
            <label style={styles.backText} value="←" />
          </view>
        )}

        {/* Title */}
        <layout style={styles.titleContainer}>
          <label style={styles.title} value={title} numberOfLines={1} />
        </layout>

        {/* Placeholder for right side */}
        {showBack && <view style={styles.placeholder} />}
      </layout>
    </view>;
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
    paddingTop: 50, // Status bar
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: `0 1 3 ${Colors.overlayLight}`,
  }),

  content: new Style<Layout>({
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
  }),

  backButton: new Style<View>({
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  backText: new Style<Label>({
    font: Fonts.h2,
    color: Colors.primary,
  }),

  titleContainer: new Style<Layout>({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  title: new Style<Label>({
    font: Fonts.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
  }),

  placeholder: new Style<View>({
    width: 44,
    height: 44,
  }),
};

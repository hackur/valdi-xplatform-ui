/**
 * Card Component
 *
 * A container component with elevation and consistent padding.
 * Used for grouping related content.
 */

import { Component, Style, View } from '@valdi/valdi_core';
import { Colors, Spacing, SemanticShadows, ShadowKey, Shadows, BorderRadius } from '../theme';

/**
 * Card Elevation Level
 */
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

/**
 * Card Props
 */
export interface CardProps {
  /** Card content (children) */
  children?: unknown;

  /** Elevation level */
  elevation?: CardElevation;

  /** Custom padding (overrides default) */
  padding?: number;

  /** Background color */
  backgroundColor?: string;

  /** Border radius */
  borderRadius?: number;

  /** Show border */
  bordered?: boolean;

  /** Tap handler (makes card interactive) */
  onTap?: () => void;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * Card Component
 */
export class Card extends Component<CardProps> {
  static defaultProps: Partial<CardProps> = {
    elevation: 'sm',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    bordered: false,
  };

  private getShadowStyle() {
    const { elevation } = this.props;

    switch (elevation) {
      case 'none':
        return Shadows.none;
      case 'sm':
        return SemanticShadows.card;
      case 'md':
        return Shadows.md;
      case 'lg':
        return Shadows.lg;
      default:
        return SemanticShadows.card;
    }
  }

  private handleTap = (): void => {
    const { onTap } = this.props;
    if (onTap) {
      onTap();
    }
  };

  onRender() {
    const {
      children,
      padding,
      backgroundColor,
      borderRadius,
      bordered,
      onTap,
      style: customStyle,
    } = this.props;

    const shadowStyle = this.getShadowStyle();

    return (
      <view
        style={{
          ...styles.container,
          backgroundColor,
          borderRadius,
          padding,
          borderWidth: bordered ? 1 : 0,
          borderColor: bordered ? Colors.border : Colors.transparent,
          ...shadowStyle,
          ...customStyle,
        }}
        onTap={onTap ? this.handleTap : undefined}
      >
        {children}
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
    overflow: 'hidden',
  }),
};

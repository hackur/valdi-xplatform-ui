/**
 * Card Component
 *
 * A container component with elevation and consistent padding.
 * Used for grouping related content.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
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
    const { elevation } = this.viewModel;

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
    const { onTap } = this.viewModel;
    if (onTap) {
      onTap();
    }
  };

  private getCardStyle(
    backgroundColor: string | undefined,
    borderRadius: number,
    padding: number,
    bordered: boolean,
    shadowStyle: Record<string, unknown>,
    customStyle?: Record<string, unknown>
  ): Style<View> {
    return new Style<View>({
      ...styles.container,
      backgroundColor: backgroundColor ?? Colors.surface,
      borderRadius,
      padding,
      borderWidth: bordered ? 1 : 0,
      borderColor: bordered ? Colors.border : Colors.transparent,
      ...shadowStyle,
      ...customStyle,
    });
  }

  onRender() {
    const {
      children,
      padding,
      backgroundColor,
      borderRadius,
      bordered,
      onTap,
      style: customStyle,
    } = this.viewModel;

    const shadowStyle = this.getShadowStyle();
    const cardStyle = this.getCardStyle(backgroundColor, borderRadius, padding, bordered, shadowStyle, customStyle);

    return (
      <view
        style={cardStyle}
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

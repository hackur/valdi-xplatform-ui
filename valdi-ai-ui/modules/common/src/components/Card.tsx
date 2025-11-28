/**
 * Card Component
 *
 * A container component with elevation and consistent padding.
 * Used for grouping related content.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import {
  Colors,
  Spacing,
  SemanticShadows,
  Shadows,
  BorderRadius,
} from '../theme';

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
  style?: Style<View> | Record<string, unknown>;
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

  private getElevationStyle(): Record<string, unknown> {
    const { elevation } = this.viewModel;

    switch (elevation) {
      case 'none':
        return {};
      case 'sm':
        return SemanticShadows.card;
      case 'md':
        return Shadows.md;
      case 'lg':
        return Shadows.lg;
      case undefined:
      default:
        return SemanticShadows.card;
    }
  }

  private readonly handleTap = (): void => {
    const { onTap } = this.viewModel;
    if (onTap) {
      onTap();
    }
  };

  private getCardStyle(
    backgroundColor: string | undefined,
    borderRadius: number | undefined,
    padding: number | undefined,
    bordered: boolean | undefined,
    shadowStyle: Record<string, unknown>,
    customStyle?: Style<View> | Record<string, unknown>,
  ): Style<View> {
    return new Style<View>({
      ...styles.container,
      backgroundColor: backgroundColor ?? Colors.surface,
      borderRadius: borderRadius ?? BorderRadius.md,
      padding: padding ?? Spacing.base,
      ...(bordered
        ? {
            borderWidth: 1,
            borderColor: Colors.border,
          }
        : {}),
      ...shadowStyle,
      ...(customStyle || {}),
    });
  }

  override onRender() {
    const {
      children,
      padding,
      backgroundColor,
      borderRadius,
      bordered,
      onTap,
      style: customStyle,
    } = this.viewModel;

    const shadowStyle = this.getElevationStyle();
    const cardStyle = this.getCardStyle(
      backgroundColor,
      borderRadius,
      padding,
      bordered,
      shadowStyle,
      customStyle,
    );

    return (
      <view style={cardStyle} onTap={onTap ? this.handleTap : undefined}>
        {children}
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    width: '100%',
  }),
};

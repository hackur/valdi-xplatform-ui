/**
 * Card Component
 *
 * A container component with elevation and consistent padding.
 * Used for grouping related content.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View } from 'valdi_tsx/src/NativeTemplateElements';
// Use explicit /index path for Valdi module resolution
import {
  Colors,
  Spacing,
  SemanticShadows,
  Shadows,
  BorderRadius,
} from '../theme/index';

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

// Helper functions for lazy defaults (avoid module initialization timing issues)
function getDefaultPadding(): number {
  return Spacing?.base ?? 12;
}

function getDefaultBackgroundColor(): string {
  return Colors?.surface ?? '#FFFFFF';
}

function getDefaultBorderRadius(): number {
  return BorderRadius?.md ?? 8;
}

/**
 * Card Component
 */
export class Card extends Component<CardProps> {
  // Use getters for default props to avoid module initialization timing issues
  static get defaultProps(): Partial<CardProps> {
    return {
      elevation: 'sm',
      padding: getDefaultPadding(),
      backgroundColor: getDefaultBackgroundColor(),
      borderRadius: getDefaultBorderRadius(),
      bordered: false,
    };
  }

  private getElevationStyle(): Record<string, unknown> {
    const { elevation } = this.viewModel;
    // Default shadow style as fallback
    const defaultShadow = {
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    };

    switch (elevation) {
      case 'none':
        return {};
      case 'sm':
        return SemanticShadows?.card ?? defaultShadow;
      case 'md':
        return Shadows?.md ?? { ...defaultShadow, shadowOpacity: 0.12, shadowRadius: 6 };
      case 'lg':
        return Shadows?.lg ?? { ...defaultShadow, shadowOpacity: 0.16, shadowRadius: 10 };
      case undefined:
      default:
        return SemanticShadows?.card ?? defaultShadow;
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
      ...getContainerStyle(),
      backgroundColor: backgroundColor ?? getDefaultBackgroundColor(),
      borderRadius: borderRadius ?? getDefaultBorderRadius(),
      padding: padding ?? getDefaultPadding(),
      ...(bordered
        ? {
            borderWidth: 1,
            borderColor: Colors?.border ?? '#E5E7EB',
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

// Lazy style getter to avoid module initialization timing issues
function getContainerStyle(): Record<string, unknown> {
  return {
    width: '100%',
  };
}

/**
 * Card Component
 * Container with shadow and padding for content grouping
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { Slot } from 'valdi_tsx/src/SlotElements';

import { Colors } from '../theme/colors';
import { BorderRadius, Shadows, Spacing } from '../theme/styles';

export interface CardViewModel {
  /** Background color */
  backgroundColor?: string;
  /** Card elevation (affects shadow) */
  elevation?: 'none' | 'sm' | 'base' | 'md' | 'lg';
  /** Border radius */
  borderRadius?: number;
  /** Padding inside card */
  padding?: number;
  /** Full width */
  fullWidth?: boolean;
  /** On tap callback */
  onTap?: () => void;
}

export class Card extends Component<CardViewModel> {
  onRender() {
    const {
      backgroundColor = Colors.surface,
      elevation = 'base',
      borderRadius = BorderRadius.base,
      padding = Spacing.base,
      fullWidth = false,
      onTap,
    } = this.viewModel;

    const shadow = this.getShadow(elevation);

    <view
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      boxShadow={shadow}
      padding={padding}
      width={fullWidth ? '100%' : undefined}
      onTap={onTap}
    >
      <layout width="100%">
        <Slot />
      </layout>
    </view>;
  }

  private getShadow(elevation: CardViewModel['elevation']): string {
    switch (elevation) {
      case 'none':
        return Shadows.none;
      case 'sm':
        return Shadows.sm;
      case 'base':
        return Shadows.base;
      case 'md':
        return Shadows.md;
      case 'lg':
        return Shadows.lg;
      default:
        return Shadows.base;
    }
  }
}

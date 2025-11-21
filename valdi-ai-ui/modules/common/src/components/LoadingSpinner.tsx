/**
 * LoadingSpinner Component
 *
 * A simple loading indicator/spinner for async operations.
 * Shows animated dots or spinner based on platform capabilities.
 */

import { Component, StatefulComponent, Style, View } from '@valdi/valdi_core';
import { Colors, Fonts, Spacing } from '../theme';

/**
 * LoadingSpinner Size
 */
export type SpinnerSize = 'small' | 'medium' | 'large';

/**
 * LoadingSpinner Props
 */
export interface LoadingSpinnerProps {
  /** Size of spinner */
  size?: SpinnerSize;

  /** Color of spinner */
  color?: string;

  /** Show loading text */
  showText?: boolean;

  /** Loading text */
  text?: string;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * LoadingSpinner State
 */
interface LoadingSpinnerState {
  dots: number;
}

/**
 * LoadingSpinner Component
 *
 * Note: For a production app, you'd want to add actual rotation animation
 * using Valdi's animate() API. This is a simplified version using dots.
 */
export class LoadingSpinner extends StatefulComponent<LoadingSpinnerProps, LoadingSpinnerState> {
  static defaultProps: Partial<LoadingSpinnerProps> = {
    size: 'medium',
    color: Colors.primary,
    showText: false,
    text: 'Loading',
  };

  state: LoadingSpinnerState = {
    dots: 1,
  };

  private interval?: NodeJS.Timeout;

  onCreate() {
    // Animate dots (1, 2, 3, repeat)
    this.interval = setInterval(() => {
      this.setState({
        dots: (this.state.dots % 3) + 1,
      });
    }, 500);
  }

  onDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private getSize(): number {
    const { size } = this.props;

    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      default:
        return 24;
    }
  }

  private getFontSize(): number {
    const { size } = this.props;

    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      default:
        return 14;
    }
  }

  private getDotsText(): string {
    const { dots } = this.state;
    return '.'.repeat(dots);
  }

  onRender() {
    const { color, showText, text, style: customStyle } = this.props;

    const size = this.getSize();
    const fontSize = this.getFontSize();
    const dotsText = this.getDotsText();

    return (
      <view
        style={{
          ...styles.container,
          ...customStyle,
        }}
      >
        {/* Spinner circle - simplified as a colored dot */}
        <view
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
            opacity: 0.7,
          }}
        />

        {/* Loading text with animated dots */}
        {showText && (
          <view style={styles.textContainer}>
            <label
              value={`${text}${dotsText}`}
              style={{
                ...Fonts.body,
                fontSize,
                color: Colors.textSecondary,
              }}
            />
          </view>
        )}
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  }),

  textContainer: new Style<View>({
    marginTop: Spacing.sm,
  }),
};

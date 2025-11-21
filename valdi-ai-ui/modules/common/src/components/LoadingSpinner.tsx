/**
 * LoadingSpinner Component
 *
 * A simple loading indicator/spinner for async operations.
 * Shows animated dots or spinner based on platform capabilities.
 * Supports fullscreen overlay mode with optional text label.
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

  /** Fullscreen overlay mode */
  fullscreen?: boolean;

  /** Overlay background color (when fullscreen) */
  overlayColor?: string;

  /** Overlay opacity (when fullscreen) */
  overlayOpacity?: number;

  /** Custom style */
  style?: Record<string, unknown>;
}

/**
 * LoadingSpinner State
 */
interface LoadingSpinnerState {
  dots: number;
  rotation: number;
}

/**
 * LoadingSpinner Component
 *
 * Enhanced with fullscreen overlay support and improved animations.
 * Uses animated dots and rotation for better visual feedback.
 */
export class LoadingSpinner extends StatefulComponent<LoadingSpinnerProps, LoadingSpinnerState> {
  static defaultProps: Partial<LoadingSpinnerProps> = {
    size: 'medium',
    color: Colors.primary,
    showText: false,
    text: 'Loading',
    fullscreen: false,
    overlayColor: Colors.background,
    overlayOpacity: 0.9,
  };

  state: LoadingSpinnerState = {
    dots: 1,
    rotation: 0,
  };

  private dotsInterval?: NodeJS.Timeout;
  private rotationInterval?: NodeJS.Timeout;

  onCreate() {
    // Animate dots (1, 2, 3, repeat)
    this.dotsInterval = setInterval(() => {
      this.setState({
        dots: (this.state.dots % 3) + 1,
      });
    }, 400);

    // Animate rotation (smoother animation)
    this.rotationInterval = setInterval(() => {
      this.setState({
        rotation: (this.state.rotation + 45) % 360,
      });
    }, 150);
  }

  onDestroy() {
    if (this.dotsInterval) {
      clearInterval(this.dotsInterval);
    }
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  private getSize(): number {
    const { size } = this.props;

    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 40;
      case 'large':
        return 56;
      default:
        return 40;
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

  private renderSpinner(): unknown {
    const { color } = this.props;
    const { rotation } = this.state;
    const size = this.getSize();

    // Create multiple rotating circles for a more complex spinner
    return (
      <view
        style={{
          width: size,
          height: size,
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer rotating circle */}
        <view
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: size / 10,
            borderColor: color,
            borderTopColor: Colors.transparent,
            borderRightColor: Colors.transparent,
            opacity: 0.8,
            transform: [{ rotate: `${rotation}deg` }],
          }}
        />

        {/* Inner pulsing dot */}
        <view
          style={{
            position: 'absolute',
            width: size / 3,
            height: size / 3,
            backgroundColor: color,
            borderRadius: size / 6,
            opacity: 0.6 + (this.state.dots * 0.1),
          }}
        />
      </view>
    );
  }

  private renderContent(): unknown {
    const { showText, text } = this.props;
    const fontSize = this.getFontSize();
    const dotsText = this.getDotsText();

    return (
      <view style={styles.contentContainer}>
        {/* Spinner */}
        {this.renderSpinner()}

        {/* Loading text with animated dots */}
        {showText && text && (
          <view style={styles.textContainer}>
            <label
              value={`${text}${dotsText}`}
              style={{
                ...Fonts.body,
                fontSize,
                color: Colors.textPrimary,
                fontWeight: '500',
              }}
            />
          </view>
        )}
      </view>
    );
  }

  onRender() {
    const {
      fullscreen,
      overlayColor,
      overlayOpacity,
      style: customStyle,
    } = this.props;

    if (fullscreen) {
      // Fullscreen overlay mode
      return (
        <view
          style={{
            ...styles.fullscreenOverlay,
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        >
          <view style={styles.fullscreenContent}>
            {this.renderContent()}
          </view>
        </view>
      );
    }

    // Standard inline mode
    return (
      <view
        style={{
          ...styles.container,
          ...customStyle,
        }}
      >
        {this.renderContent()}
      </view>
    );
  }
}

const styles = {
  container: new Style<View>({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  contentContainer: new Style<View>({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  }),

  textContainer: new Style<View>({
    minWidth: 80,
    alignItems: 'center',
  }),

  fullscreenOverlay: new Style<View>({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  }),

  fullscreenContent: new Style<View>({
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }),
};

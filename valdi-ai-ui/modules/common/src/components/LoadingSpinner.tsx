/**
 * LoadingSpinner Component
 *
 * A simple loading indicator/spinner for async operations.
 * Shows animated dots or spinner based on platform capabilities.
 * Supports fullscreen overlay mode with optional text label.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont } from 'valdi_core/src/SystemFont';
import { Colors, Spacing } from '../theme';

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
export class LoadingSpinner extends StatefulComponent<
  LoadingSpinnerProps,
  LoadingSpinnerState
> {
  static defaultProps: Partial<LoadingSpinnerProps> = {
    size: 'medium',
    color: Colors.primary,
    showText: false,
    text: 'Loading',
    fullscreen: false,
    overlayColor: Colors.background,
    overlayOpacity: 0.9,
  };

  override state: LoadingSpinnerState = {
    dots: 1,
    rotation: 0,
  };

  private dotsInterval?: number;
  private rotationInterval?: number;

  override onCreate() {
    // Animate dots (1, 2, 3, repeat)
    this.dotsInterval = setInterval(() => {
      this.setState({
        dots: (this.state.dots % 3) + 1,
      });
    }, 400) as unknown as number;

    // Animate rotation (smoother animation)
    this.rotationInterval = setInterval(() => {
      this.setState({
        rotation: (this.state.rotation + 45) % 360,
      });
    }, 150) as unknown as number;
  }

  override onDestroy() {
    if (this.dotsInterval) {
      clearInterval(this.dotsInterval);
    }
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  private getSize(): number {
    const { size } = this.viewModel;
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
    const { size } = this.viewModel;
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

  private getTextLabelStyle(fontSize: number): Style {
    return new Style({
      font: systemFont(fontSize),
      color: Colors.textPrimary,
    });
  }

  private getDotsText(): string {
    const { dots } = this.state;
    return '.'.repeat(dots);
  }

  private getSpinnerContainerStyle(size: number): Style {
    return new Style({
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    });
  }

  private getOuterCircleStyle(
    size: number,
    color: string | undefined,
  ): Style {
    return new Style({
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: size / 10,
      borderColor: color ?? Colors.primary,
      opacity: 0.8,
      // Note: transform property not supported in Valdi - rotation animation disabled
    });
  }

  private getInnerDotStyle(
    size: number,
    color: string | undefined,
    dots: number,
  ): Style {
    return new Style({
      position: 'absolute',
      width: size / 3,
      height: size / 3,
      backgroundColor: color ?? Colors.primary,
      borderRadius: size / 6,
      opacity: 0.6 + dots * 0.1,
    });
  }

  private renderSpinner(): unknown {
    const { color } = this.viewModel;
    const { dots } = this.state;
    const size = this.getSize();

    const spinnerContainerStyle = this.getSpinnerContainerStyle(size);
    const outerCircleStyle = this.getOuterCircleStyle(size, color);
    const innerDotStyle = this.getInnerDotStyle(size, color, dots);

    // Create multiple rotating circles for a more complex spinner
    // Note: Rotation animation disabled due to Valdi transform limitations
    return (
      <view style={spinnerContainerStyle}>
        {/* Outer circle */}
        <view style={outerCircleStyle} />

        {/* Inner pulsing dot */}
        <view style={innerDotStyle} />
      </view>
    );
  }

  private renderContent(): unknown {
    const { showText, text } = this.viewModel;
    const fontSize = this.getFontSize();
    const dotsText = this.getDotsText();
    const textLabelStyle = this.getTextLabelStyle(fontSize);

    return (
      <view style={styles.contentContainer}>
        {/* Spinner */}
        {this.renderSpinner()}

        {/* Loading text with animated dots */}
        {showText && text && (
          <view style={styles.textContainer}>
            <label value={`${text}${dotsText}`} style={textLabelStyle} />
          </view>
        )}
      </view>
    );
  }

  private getFullscreenOverlayStyle(
    overlayColor: string | undefined,
    overlayOpacity: number | undefined,
  ): Style {
    return new Style({
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
      backgroundColor: overlayColor ?? Colors.background,
      opacity: overlayOpacity ?? 0.9,
    });
  }

  private getContainerStyle(
    customStyle?: Record<string, unknown>,
  ): Style {
    return new Style({
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...customStyle,
    });
  }

  override onRender() {
    const {
      fullscreen,
      overlayColor,
      overlayOpacity,
      style: customStyle,
    } = this.viewModel;

    if (fullscreen) {
      // Fullscreen overlay mode
      const fullscreenOverlayStyle = this.getFullscreenOverlayStyle(
        overlayColor,
        overlayOpacity,
      );

      return (
        <view style={fullscreenOverlayStyle}>
          <view style={styles.fullscreenContent}>{this.renderContent()}</view>
        </view>
      );
    }

    // Standard inline mode
    const containerStyle = this.getContainerStyle(customStyle);

    return <view style={containerStyle}>{this.renderContent()}</view>;
  }
}

const styles = {
  container: new Style({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  contentContainer: new Style({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  textContainer: new Style({
    minWidth: 80,
    alignItems: 'center',
  }),

  fullscreenOverlay: new Style({
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

  fullscreenContent: new Style({
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }),
};

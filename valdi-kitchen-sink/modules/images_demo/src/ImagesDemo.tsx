/**
 * ImagesDemo Component
 * Demonstrates <image>, <video>, and <animatedimage> (Lottie) components
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import {
  View,
  Label,
  Layout,
  ScrollView,
  Image,
  Video,
  AnimatedImage,
  Spinner
} from 'valdi_tsx/src/NativeTemplateElements';

import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Header,
  DemoSection,
  Card,
  Button,
  CodeBlock,
} from '../../common/src/index';

export interface ImagesDemoViewModel {
  navigationController: NavigationController;
}

interface ImagesDemoState {
  // Basic image loading
  imageLoading: boolean;
  imageError?: string;
  imageDimensions?: { width: number; height: number };

  // ObjectFit selection
  selectedObjectFit: 'fill' | 'contain' | 'cover' | 'none';

  // Video playback
  videoPlaying: boolean;
  videoVolume: number;
  videoCurrentTime: number;
  videoDuration: number;
  videoError?: string;

  // Animated image (Lottie)
  animationSpeed: number;
  animationLoop: boolean;

  // Image effects
  tintEnabled: boolean;
  rotationAngle: number;
  scaleX: number;
  scaleY: number;
}

@NavigationPage(module)
export class ImagesDemo extends StatefulComponent<ImagesDemoViewModel, ImagesDemoState> {
  state: ImagesDemoState = {
    // Basic image loading
    imageLoading: false,
    imageError: undefined,
    imageDimensions: undefined,

    // ObjectFit
    selectedObjectFit: 'cover',

    // Video
    videoPlaying: false,
    videoVolume: 0.5,
    videoCurrentTime: 0,
    videoDuration: 0,
    videoError: undefined,

    // Animation
    animationSpeed: 1,
    animationLoop: true,

    // Effects
    tintEnabled: false,
    rotationAngle: 0,
    scaleX: 1,
    scaleY: 1,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Images & Media"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Basic Image Loading */}
          {this.renderImageLoading()}

          {/* ObjectFit Modes */}
          {this.renderObjectFitModes()}

          {/* Video Playback */}
          {this.renderVideoPlayback()}

          {/* Animated Images (Lottie) */}
          {this.renderAnimatedImage()}

          {/* Image Effects */}
          {this.renderImageEffects()}

          {/* Code Example */}
          {this.renderCodeExample()}
        </layout>
      </scroll>
    </view>;
  }

  private renderImageLoading() {
    <DemoSection
      title="Basic Image Loading"
      description="Load images with loading states and error handling"
    >
      <Card>
        <layout width="100%" gap={Spacing.md}>
          {/* Image container */}
          <view style={styles.imageContainer}>
            {/* Loading overlay */}
            {this.state.imageLoading && (
              <view style={styles.loadingOverlay}>
                <spinner color={Colors.primary} />
                <label
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                  value="Loading..."
                  marginTop={Spacing.sm}
                />
              </view>
            )}

            {/* Image */}
            <image
              width="100%"
              height={200}
              src="https://picsum.photos/800/600"
              objectFit="cover"
              borderRadius={BorderRadius.base}
              onAssetLoad={(success, errorMessage) => {
                this.setState({
                  imageLoading: false,
                  imageError: success ? undefined : errorMessage,
                });
              }}
              onImageDecoded={(width, height) => {
                this.setState({ imageDimensions: { width, height } });
              }}
            />

            {/* Error state */}
            {this.state.imageError && (
              <view style={styles.errorOverlay}>
                <label
                  font={Fonts.body}
                  color={Colors.error}
                  value={`Error: ${this.state.imageError}`}
                  textAlign="center"
                />
              </view>
            )}
          </view>

          {/* Image info */}
          {this.state.imageDimensions && (
            <layout width="100%" gap={Spacing.xs}>
              <label
                font={Fonts.labelSmall}
                color={Colors.textSecondary}
                value="Image loaded successfully"
              />
              <label
                font={Fonts.caption}
                color={Colors.textTertiary}
                value={`Dimensions: ${this.state.imageDimensions.width} x ${this.state.imageDimensions.height}`}
              />
            </layout>
          )}

          {/* Reload button */}
          <Button
            title="Reload Image"
            variant="outline"
            size="small"
            onTap={() => this.reloadImage()}
          />
        </layout>
      </Card>
    </DemoSection>;
  }

  private renderObjectFitModes() {
    const objectFitModes: Array<{ mode: 'fill' | 'contain' | 'cover' | 'none'; description: string }> = [
      { mode: 'fill', description: 'Stretch to fill (may distort)' },
      { mode: 'contain', description: 'Fit within bounds (blank space)' },
      { mode: 'cover', description: 'Fill bounds (may crop)' },
      { mode: 'none', description: 'No scaling, centered' },
    ];

    <DemoSection
      title="ObjectFit Modes"
      description="Different ways images can be sized and positioned"
    >
      <Card>
        <layout width="100%" gap={Spacing.md}>
          {/* Mode selector */}
          <layout flexDirection="row" gap={Spacing.sm} flexWrap="wrap">
            {objectFitModes.forEach(item => (
              <Button
                key={item.mode}
                title={item.mode}
                variant={this.state.selectedObjectFit === item.mode ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ selectedObjectFit: item.mode })}
              />
            ))}
          </layout>

          {/* Description */}
          <label
            font={Fonts.caption}
            color={Colors.textSecondary}
            value={
              objectFitModes.find(m => m.mode === this.state.selectedObjectFit)?.description || ''
            }
          />

          {/* Preview container with fixed aspect ratio */}
          <view
            width="100%"
            height={200}
            backgroundColor={Colors.gray100}
            borderRadius={BorderRadius.base}
            overflow="hidden"
          >
            <image
              width="100%"
              height="100%"
              src="https://picsum.photos/800/400"
              objectFit={this.state.selectedObjectFit}
            />
          </view>

          {/* Wide image example */}
          <layout width="100%" gap={Spacing.xs}>
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value="Wide image (16:9):"
            />
            <view
              width="100%"
              height={150}
              backgroundColor={Colors.gray100}
              borderRadius={BorderRadius.base}
              overflow="hidden"
            >
              <image
                width="100%"
                height="100%"
                src="https://picsum.photos/1600/900"
                objectFit={this.state.selectedObjectFit}
              />
            </view>
          </layout>

          {/* Square image example */}
          <layout width="100%" gap={Spacing.xs}>
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value="Square image (1:1):"
            />
            <view
              width={150}
              height={150}
              backgroundColor={Colors.gray100}
              borderRadius={BorderRadius.base}
              overflow="hidden"
            >
              <image
                width="100%"
                height="100%"
                src="https://picsum.photos/600/600"
                objectFit={this.state.selectedObjectFit}
              />
            </view>
          </layout>
        </layout>
      </Card>
    </DemoSection>;
  }

  private renderVideoPlayback() {
    const progress =
      this.state.videoDuration > 0
        ? (this.state.videoCurrentTime / this.state.videoDuration) * 100
        : 0;

    <DemoSection
      title="Video Playback"
      description="Play videos with controls, volume, and seeking"
    >
      <Card>
        <layout width="100%" gap={Spacing.md}>
          {/* Video player */}
          <view
            width="100%"
            height={200}
            backgroundColor={Colors.black}
            borderRadius={BorderRadius.base}
            overflow="hidden"
          >
            <video
              width="100%"
              height="100%"
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              playbackRate={this.state.videoPlaying ? 1 : 0}
              volume={this.state.videoVolume}
              seekToTime={this.state.videoCurrentTime}
              onVideoLoaded={(duration) => {
                this.setState({ videoDuration: duration });
              }}
              onProgressUpdated={(time, duration) => {
                this.setState({ videoCurrentTime: time });
              }}
              onError={(error) => {
                this.setState({ videoError: error });
              }}
              onCompleted={() => {
                this.setState({ videoPlaying: false, videoCurrentTime: 0 });
              }}
            />
          </view>

          {/* Error display */}
          {this.state.videoError && (
            <label
              font={Fonts.caption}
              color={Colors.error}
              value={`Video error: ${this.state.videoError}`}
            />
          )}

          {/* Progress bar */}
          <view width="100%" height={4} backgroundColor={Colors.gray200} borderRadius={2}>
            <view
              width={`${progress}%`}
              height="100%"
              backgroundColor={Colors.primary}
              borderRadius={2}
            />
          </view>

          {/* Time display */}
          <label
            font={Fonts.caption}
            color={Colors.textSecondary}
            value={`${this.formatTime(this.state.videoCurrentTime)} / ${this.formatTime(this.state.videoDuration)}`}
            textAlign="center"
          />

          {/* Playback controls */}
          <layout flexDirection="row" gap={Spacing.sm} justifyContent="center" alignItems="center">
            <Button
              title={this.state.videoPlaying ? 'Pause' : 'Play'}
              variant="primary"
              size="small"
              onTap={() => this.toggleVideoPlayback()}
            />
            <Button
              title="Restart"
              variant="outline"
              size="small"
              onTap={() => this.setState({ videoCurrentTime: 0 })}
            />
          </layout>

          {/* Volume control */}
          <layout width="100%" gap={Spacing.xs}>
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value={`Volume: ${Math.round(this.state.videoVolume * 100)}%`}
            />
            <layout flexDirection="row" gap={Spacing.sm}>
              <Button
                title="0%"
                variant="outline"
                size="small"
                onTap={() => this.setState({ videoVolume: 0 })}
              />
              <Button
                title="50%"
                variant="outline"
                size="small"
                onTap={() => this.setState({ videoVolume: 0.5 })}
              />
              <Button
                title="100%"
                variant="outline"
                size="small"
                onTap={() => this.setState({ videoVolume: 1 })}
              />
            </layout>
          </layout>
        </layout>
      </Card>
    </DemoSection>;
  }

  private renderAnimatedImage() {
    <DemoSection
      title="Animated Images (Lottie)"
      description="Play Lottie animations with speed and loop controls"
    >
      <Card>
        <layout width="100%" gap={Spacing.md}>
          {/* Animation preview */}
          <view
            width="100%"
            height={200}
            backgroundColor={Colors.gray50}
            borderRadius={BorderRadius.base}
            alignItems="center"
            justifyContent="center"
          >
            <animatedimage
              width={150}
              height={150}
              src="https://assets9.lottiefiles.com/packages/lf20_uwR49r.json"
              loop={this.state.animationLoop}
              advanceRate={this.state.animationSpeed}
              objectFit="contain"
              onProgress={(event) => {
                // Progress tracking available if needed
                // console.log(`Animation progress: ${event.time}/${event.duration}`);
              }}
            />
          </view>

          {/* Loop toggle */}
          <layout flexDirection="row" gap={Spacing.sm} alignItems="center">
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value="Loop animation:"
            />
            <Button
              title={this.state.animationLoop ? 'ON' : 'OFF'}
              variant={this.state.animationLoop ? 'primary' : 'outline'}
              size="small"
              onTap={() => this.setState({ animationLoop: !this.state.animationLoop })}
            />
          </layout>

          {/* Speed controls */}
          <layout width="100%" gap={Spacing.xs}>
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value="Animation speed:"
            />
            <layout flexDirection="row" gap={Spacing.sm} flexWrap="wrap">
              <Button
                title="0.5x"
                variant={this.state.animationSpeed === 0.5 ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ animationSpeed: 0.5 })}
              />
              <Button
                title="1x"
                variant={this.state.animationSpeed === 1 ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ animationSpeed: 1 })}
              />
              <Button
                title="2x"
                variant={this.state.animationSpeed === 2 ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ animationSpeed: 2 })}
              />
              <Button
                title="Reverse"
                variant={this.state.animationSpeed === -1 ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ animationSpeed: -1 })}
              />
              <Button
                title="Pause"
                variant={this.state.animationSpeed === 0 ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ animationSpeed: 0 })}
              />
            </layout>
          </layout>
        </layout>
      </Card>
    </DemoSection>;
  }

  private renderImageEffects() {
    <DemoSection
      title="Image Effects & Transformations"
      description="Apply tint, scaling, and rotation to images"
    >
      <Card>
        <layout width="100%" gap={Spacing.md}>
          {/* Effects preview */}
          <view
            width="100%"
            height={200}
            backgroundColor={Colors.gray100}
            borderRadius={BorderRadius.base}
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <image
              width={150}
              height={150}
              src="https://picsum.photos/400/400"
              objectFit="contain"
              tint={this.state.tintEnabled ? Colors.primary : undefined}
              contentScaleX={this.state.scaleX}
              contentScaleY={this.state.scaleY}
              contentRotation={this.state.rotationAngle}
            />
          </view>

          {/* Tint control */}
          <layout flexDirection="row" gap={Spacing.sm} alignItems="center">
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value="Color tint:"
            />
            <Button
              title={this.state.tintEnabled ? 'ON' : 'OFF'}
              variant={this.state.tintEnabled ? 'primary' : 'outline'}
              size="small"
              onTap={() => this.setState({ tintEnabled: !this.state.tintEnabled })}
            />
          </layout>

          {/* Rotation controls */}
          <layout width="100%" gap={Spacing.xs}>
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value={`Rotation: ${Math.round((this.state.rotationAngle * 180) / Math.PI)}°`}
            />
            <layout flexDirection="row" gap={Spacing.sm} flexWrap="wrap">
              <Button
                title="0°"
                variant="outline"
                size="small"
                onTap={() => this.setState({ rotationAngle: 0 })}
              />
              <Button
                title="45°"
                variant="outline"
                size="small"
                onTap={() => this.setState({ rotationAngle: Math.PI / 4 })}
              />
              <Button
                title="90°"
                variant="outline"
                size="small"
                onTap={() => this.setState({ rotationAngle: Math.PI / 2 })}
              />
              <Button
                title="180°"
                variant="outline"
                size="small"
                onTap={() => this.setState({ rotationAngle: Math.PI })}
              />
            </layout>
          </layout>

          {/* Scale controls */}
          <layout width="100%" gap={Spacing.xs}>
            <label
              font={Fonts.labelSmall}
              color={Colors.textSecondary}
              value={`Scale: ${this.state.scaleX}x`}
            />
            <layout flexDirection="row" gap={Spacing.sm} flexWrap="wrap">
              <Button
                title="0.5x"
                variant="outline"
                size="small"
                onTap={() => this.setState({ scaleX: 0.5, scaleY: 0.5 })}
              />
              <Button
                title="1x"
                variant="outline"
                size="small"
                onTap={() => this.setState({ scaleX: 1, scaleY: 1 })}
              />
              <Button
                title="1.5x"
                variant="outline"
                size="small"
                onTap={() => this.setState({ scaleX: 1.5, scaleY: 1.5 })}
              />
              <Button
                title="2x"
                variant="outline"
                size="small"
                onTap={() => this.setState({ scaleX: 2, scaleY: 2 })}
              />
            </layout>
          </layout>

          {/* Reset button */}
          <Button
            title="Reset All Effects"
            variant="secondary"
            onTap={() => this.resetEffects()}
          />
        </layout>
      </Card>
    </DemoSection>;
  }

  private renderCodeExample() {
    <DemoSection title="Code Example">
      <CodeBlock
        language="tsx"
        code={`// Basic image loading
<image
  src="https://example.com/image.jpg"
  objectFit="cover"
  width={300}
  height={200}
  onAssetLoad={(success, error) => {
    if (success) {
      console.log('Image loaded');
    } else {
      console.error('Error:', error);
    }
  }}
  onImageDecoded={(width, height) => {
    console.log(\`Dimensions: \${width}x\${height}\`);
  }}
/>

// Video playback
<video
  src="video.mp4"
  playbackRate={isPlaying ? 1 : 0}
  volume={0.5}
  seekToTime={currentTime}
  onVideoLoaded={(duration) => {
    console.log('Duration:', duration);
  }}
  onProgressUpdated={(time, duration) => {
    console.log('Progress:', time, '/', duration);
  }}
/>

// Animated image (Lottie)
<animatedimage
  src="animation.json"
  loop={true}
  advanceRate={1}  // 1 = normal, 0 = paused, -1 = reverse
  objectFit="contain"
/>

// Image with effects
<image
  src="image.jpg"
  tint="#3B82F6"
  contentScaleX={1.5}
  contentScaleY={1.5}
  contentRotation={Math.PI / 4}  // 45 degrees
/>`}
      />
    </DemoSection>;
  }

  // Helper methods
  private reloadImage() {
    this.setState({ imageLoading: true, imageError: undefined, imageDimensions: undefined });
    // The image will reload automatically when state changes
  }

  private toggleVideoPlayback() {
    this.setState({ videoPlaying: !this.state.videoPlaying });
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private resetEffects() {
    this.setState({
      tintEnabled: false,
      rotationAngle: 0,
      scaleX: 1,
      scaleY: 1,
    });
  }
}

const styles = {
  page: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  }),

  scroll: new Style<ScrollView>({
    width: '100%',
    flex: 1,
  }),

  content: new Style<Layout>({
    width: '100%',
    padding: Spacing.base,
  }),

  imageContainer: new Style<View>({
    width: '100%',
    height: 200,
    position: 'relative',
    borderRadius: BorderRadius.base,
    overflow: 'hidden',
  }),

  loadingOverlay: new Style<View>({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  errorOverlay: new Style<View>({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.error,
    opacity: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  }),
};

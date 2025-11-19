# Images & Media Demo - Implementation Plan

## Overview
Demonstrate Valdi's media capabilities including static images, video playback, and animated content (Lottie). Show loading states, error handling, and different display modes.

## Valdi Capabilities Identified

### ImageView Component
```typescript
interface ImageView {
  src?: string | Asset;  // Image source (URL or Asset)
  objectFit?: 'fill' | 'contain' | 'cover' | 'none';  // Resize mode
  onAssetLoad?: (success: boolean, errorMessage?: string) => void;
  onImageDecoded?: (width: number, height: number) => void;
  tint?: Color;  // Apply color tint
  contentScaleX?: number;  // Scale content horizontally
  contentScaleY?: number;  // Scale content vertically
  contentRotation?: number;  // Rotate content in radians
  filter?: ImageFilter;  // Post-processing filter
}
```

### VideoView Component
```typescript
interface VideoView {
  src?: string | Asset;
  volume?: number;  // 0-1
  playbackRate?: number;  // 0 = paused, 1 = playing
  seekToTime?: number;  // In milliseconds
  onVideoLoaded?: (duration: number) => void;
  onBeginPlaying?: () => void;
  onError?: (error: string) => void;
  onCompleted?: () => void;
  onProgressUpdated?: (time: number, duration: number) => void;
}
```

### AnimatedImage Component (Lottie)
```typescript
interface AnimatedImage {
  src?: string | Asset;
  loop?: boolean;
  advanceRate?: number;  // 0 = paused, 1 = normal, 0.5 = half speed, -1 = reverse
  currentTime?: number;
  animationStartTime?: number;
  animationEndTime?: number;
  onProgress?: (event: {time: number, duration: number}) => void;
  objectFit?: ImageObjectFit;
}
```

## Implementation Sections

### 1. Basic Image Loading (2 hours)

**Features to demonstrate:**
- Loading from remote URL
- Loading from local Asset
- Loading states (loading indicator while fetching)
- Error handling with fallback/error message
- onAssetLoad callback usage
- onImageDecoded for dimension tracking

**Example structure:**
```typescript
interface ImageLoadingState {
  isLoading: boolean;
  error?: string;
  dimensions?: {width: number, height: number};
}

<DemoSection title="Image Loading">
  {/* Remote URL */}
  <ImageLoadExample
    src="https://example.com/image.jpg"
    label="Remote URL"
  />

  {/* Show loading spinner */}
  {this.state.isLoading && <spinner color={Colors.primary} />}

  {/* Error state */}
  {this.state.error && <label value={`Error: ${this.state.error}`} />}

  {/* Success - show dimensions */}
  {this.state.dimensions && (
    <label value={`${this.state.dimensions.width}x${this.state.dimensions.height}`} />
  )}
</DemoSection>
```

### 2. ObjectFit Modes (1.5 hours)

**Demonstrate all 4 modes:**
- `fill` - Stretch to fill bounds (may distort)
- `contain` - Fit within bounds preserving aspect ratio (may have blank space)
- `cover` - Fill bounds preserving aspect ratio (may crop)
- `none` - No scaling, centered

**Example:**
```typescript
const objectFitModes: Array<{mode: ImageObjectFit, description: string}> = [
  {mode: 'fill', description: 'Stretch to fill (may distort)'},
  {mode: 'contain', description: 'Fit within bounds (blank space)'},
  {mode: 'cover', description: 'Fill bounds (may crop)'},
  {mode: 'none', description: 'No scaling, centered'},
];

{objectFitModes.forEach(item => (
  <view key={item.mode} style={styles.objectFitExample}>
    <label value={`${item.mode}: ${item.description}`} />
    <image
      src="https://example.com/wide-image.jpg"
      objectFit={item.mode}
      width={200}
      height={150}
    />
  </view>
))}
```

### 3. Video Playback (2 hours)

**Features:**
- Play/pause control
- Volume slider
- Seek bar (progress + seeking)
- Current time / duration display
- onProgressUpdated for real-time tracking
- Error handling

**State management:**
```typescript
interface VideoState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  error?: string;
}

// Toggle play/pause
togglePlayback() {
  this.setState({
    isPlaying: !this.state.isPlaying
  });
}

// Update seek position
onSeek(time: number) {
  this.setState({ currentTime: time });
}
```

**UI structure:**
```typescript
<DemoSection title="Video Playback">
  <video
    src="https://example.com/video.mp4"
    playbackRate={this.state.isPlaying ? 1 : 0}
    volume={this.state.volume}
    seekToTime={this.state.currentTime}
    onVideoLoaded={(duration) => this.setState({duration})}
    onProgressUpdated={(time, duration) => this.setState({currentTime: time})}
    onError={(error) => this.setState({error})}
    style={styles.videoPlayer}
  />

  {/* Controls */}
  <layout style={styles.controls}>
    <Button
      title={this.state.isPlaying ? "Pause" : "Play"}
      onTap={() => this.togglePlayback()}
    />
    <label value={`${formatTime(this.state.currentTime)} / ${formatTime(this.state.duration)}`} />
  </layout>
</DemoSection>
```

### 4. Animated Images (Lottie) (1.5 hours)

**Features:**
- Play/pause animation
- Speed control (0.5x, 1x, 2x, reverse)
- Loop toggle
- Progress tracking

**Example:**
```typescript
<DemoSection title="Animated Images (Lottie)">
  <animatedimage
    src="lottie-animation.json"
    loop={this.state.loopAnimation}
    advanceRate={this.state.playbackSpeed}
    objectFit="contain"
    onProgress={(event) => console.log(`Progress: ${event.time}/${event.duration}`)}
  />

  {/* Speed controls */}
  <layout flexDirection="row">
    <Button title="0.5x" onTap={() => this.setState({playbackSpeed: 0.5})} />
    <Button title="1x" onTap={() => this.setState({playbackSpeed: 1})} />
    <Button title="2x" onTap={() => this.setState({playbackSpeed: 2})} />
    <Button title="Reverse" onTap={() => this.setState({playbackSpeed: -1})} />
  </layout>
</DemoSection>
```

### 5. Image Effects & Transformations (1 hour)

**Features:**
- Color tint
- Content scaling (contentScaleX/Y)
- Content rotation
- Filters (if available)

**Example:**
```typescript
<DemoSection title="Image Effects">
  {/* Tint */}
  <image src="image.jpg" tint={Colors.primary} />

  {/* Scaled content */}
  <image
    src="image.jpg"
    contentScaleX={1.5}
    contentScaleY={1.5}
  />

  {/* Rotated */}
  <image
    src="image.jpg"
    contentRotation={Math.PI / 4}  // 45 degrees
  />
</DemoSection>
```

## State Management

```typescript
interface ImagesDemoState {
  // Basic image loading
  imageLoading: boolean;
  imageError?: string;
  imageDimensions?: {width: number, height: number};

  // Video playback
  videoPlaying: boolean;
  videoVolume: number;
  videoCurrentTime: number;
  videoDuration: number;
  videoError?: string;

  // Animated image
  animationSpeed: number;
  animationLoop: boolean;

  // Effects
  selectedTint?: string;
  rotationAngle: number;
}
```

## Code Examples to Include

### Image with Loading State
```typescript
private renderImageWithLoading() {
  <view style={styles.imageContainer}>
    {this.state.imageLoading && (
      <view style={styles.loadingOverlay}>
        <spinner color={Colors.primary} />
        <label value="Loading..." />
      </view>
    )}

    <image
      src="https://example.com/large-image.jpg"
      objectFit="cover"
      onAssetLoad={(success, error) => {
        this.setState({
          imageLoading: false,
          imageError: success ? undefined : error
        });
      }}
      onImageDecoded={(width, height) => {
        this.setState({imageDimensions: {width, height}});
      }}
    />

    {this.state.imageError && (
      <label value={`Failed to load: ${this.state.imageError}`} color={Colors.error} />
    )}
  </view>;
}
```

### Video Player with Seek Bar
```typescript
private renderVideoPlayer() {
  const progress = this.state.videoDuration > 0
    ? this.state.videoCurrentTime / this.state.videoDuration
    : 0;

  <view style={styles.videoSection}>
    <video
      src="video.mp4"
      playbackRate={this.state.videoPlaying ? 1 : 0}
      volume={this.state.videoVolume}
      seekToTime={this.state.videoCurrentTime}
      onVideoLoaded={(duration) => this.setState({videoDuration: duration})}
      onProgressUpdated={(time) => this.setState({videoCurrentTime: time})}
      onCompleted={() => this.setState({videoPlaying: false})}
    />

    {/* Progress bar - interactive seek */}
    <view
      style={styles.seekBar}
      onTap={(event) => {
        const seekTime = (event.x / event.width) * this.state.videoDuration;
        this.setState({videoCurrentTime: seekTime});
      }}
    >
      <view style={{...styles.seekProgress, width: `${progress * 100}%`}} />
    </view>
  </view>;
}
```

## Asset Requirements

**Images needed:**
- Square image (1:1 aspect ratio)
- Wide image (16:9 aspect ratio)
- Tall image (9:16 aspect ratio)
- High-resolution image (for loading demo)

**Videos needed:**
- Short video clip (10-20 seconds)
- MP4 format

**Animations needed:**
- Lottie JSON file (simple animation like loading spinner or icon)

## Performance Considerations

1. **Image caching**: Images loaded from URLs are cached by Valdi
2. **Lazy loading**: Use `limitToViewport={true}` for images in scrollable area
3. **Memory**: Don't load too many high-res images simultaneously
4. **Video**: Only one video playing at a time

## Estimated Effort

- **Basic image loading**: 2 hours
- **ObjectFit modes**: 1.5 hours
- **Video playback**: 2 hours
- **Animated images**: 1.5 hours
- **Image effects**: 1 hour
- **Testing & polish**: 1 hour

**Total: 9 hours** (more than initial estimate due to comprehensive coverage)

## Success Criteria

- [ ] Images load from both URLs and Assets
- [ ] Loading states visible with spinner
- [ ] Errors handled gracefully with messages
- [ ] All 4 objectFit modes demonstrated clearly
- [ ] Video can play/pause with controls
- [ ] Video seek bar functional and updates in real-time
- [ ] Animated image (Lottie) plays with speed controls
- [ ] Image effects (tint, scale, rotation) working
- [ ] Works on both iOS and Android
- [ ] No memory leaks or crashes

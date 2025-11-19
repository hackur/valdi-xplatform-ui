# Scrolling & Lists Demo - Implementation Plan

## Overview
Demonstrate Valdi's comprehensive scrolling capabilities including vertical/horizontal scrolling, scroll events, paging, programmatic control, and performance optimization with viewport extensions.

## Valdi Capabilities Identified

### ScrollView Component
```typescript
interface ScrollView {
  // Scroll direction
  horizontal?: boolean;  // false = vertical (default), true = horizontal

  // Scroll behavior
  bounces?: boolean;  // Enable bounce at edges (default: true)
  pagingEnabled?: boolean;  // Snap to page boundaries
  scrollEnabled?: boolean;  // Allow user scrolling (default: true)

  // Programmatic scrolling
  contentOffsetX?: number;  // Horizontal scroll position
  contentOffsetY?: number;  // Vertical scroll position

  // Performance optimization
  viewportExtensionTop?: number;  // Preload content above viewport
  viewportExtensionRight?: number;  // Preload content right of viewport
  viewportExtensionBottom?: number;  // Preload content below viewport
  viewportExtensionLeft?: number;  // Preload content left of viewport
  limitToViewport?: boolean;  // Only render visible children

  // Scroll events
  onScroll?: (event: ScrollEvent) => void;
  onScrollEnd?: (event: ScrollEndEvent) => void;
  onDragStart?: (event: ScrollEvent) => void;
  onDragEnding?: (event: ScrollDragEndingEvent) => ScrollOffset | undefined;
  onDragEnd?: (event: ScrollDragEndEvent) => void;
}
```

### ScrollEvent Interface
```typescript
interface ScrollEvent {
  offset: ScrollOffset;  // { x: number, y: number }
  overscrollTension: ScrollOffset;  // Rubber-band effect amount
  velocity: ScrollOffset;  // Current scroll velocity
}

interface ScrollEndEvent {
  offset: ScrollOffset;
  decelerated: boolean;  // true if stopped from deceleration, false if interrupted
}

interface ScrollDragEndingEvent {
  offset: ScrollOffset;
  velocity: ScrollOffset;
  targetOffset: ScrollOffset;  // Where scroll will naturally stop
}
```

## Implementation Sections

### 1. Basic Scrolling (Vertical & Horizontal) (1.5 hours)

**Features to demonstrate:**
- Vertical scrolling (default)
- Horizontal scrolling
- Bounce effects on/off
- Content larger than viewport
- Nested scroll views (if supported)

**Example structure:**
```typescript
interface ScrollingState {
  verticalBounces: boolean;
  horizontalBounces: boolean;
}

<DemoSection title="Vertical Scrolling">
  <scroll
    horizontal={false}
    bounces={this.state.verticalBounces}
    style={styles.verticalScroll}
  >
    {/* Long vertical content */}
    {Array.from({ length: 20 }).map((_, i) => (
      <view key={i} style={styles.scrollItem}>
        <label value={`Item ${i + 1}`} />
      </view>
    ))}
  </scroll>

  <Button
    title={this.state.verticalBounces ? "Disable Bounce" : "Enable Bounce"}
    onTap={() => this.setState({ verticalBounces: !this.state.verticalBounces })}
  />
</DemoSection>

<DemoSection title="Horizontal Scrolling">
  <scroll
    horizontal={true}
    bounces={this.state.horizontalBounces}
    style={styles.horizontalScroll}
  >
    <layout flexDirection="row">
      {Array.from({ length: 10 }).map((_, i) => (
        <view key={i} style={styles.horizontalItem}>
          <label value={`${i + 1}`} />
        </view>
      ))}
    </layout>
  </scroll>
</DemoSection>
```

### 2. Scroll Events & Tracking (2 hours)

**Features:**
- onScroll event with real-time position tracking
- Scroll velocity display
- onScrollEnd detection
- Drag start/end events
- Overscroll tension visualization (rubber-band effect)

**State management:**
```typescript
interface ScrollTrackingState {
  scrollPosition: { x: number, y: number };
  scrollVelocity: { x: number, y: number };
  isScrolling: boolean;
  isDragging: boolean;
  overscrollTension: { x: number, y: number };
}

// Track scroll position in real-time
onScroll(event: ScrollEvent) {
  this.setState({
    scrollPosition: event.offset,
    scrollVelocity: event.velocity,
    overscrollTension: event.overscrollTension,
    isScrolling: true,
  });
}

// Detect scroll end
onScrollEnd(event: ScrollEndEvent) {
  this.setState({
    isScrolling: false,
    scrollPosition: event.offset,
  });

  console.log(`Scroll ended at ${event.offset.y}`);
  console.log(`Decelerated: ${event.decelerated}`);
}

// Track drag gestures
onDragStart(event: ScrollEvent) {
  this.setState({ isDragging: true });
}

onDragEnd(event: ScrollDragEndEvent) {
  this.setState({ isDragging: false });
}
```

**UI structure:**
```typescript
<DemoSection title="Scroll Event Tracking">
  <scroll
    onScroll={(e) => this.onScroll(e)}
    onScrollEnd={(e) => this.onScrollEnd(e)}
    onDragStart={(e) => this.onDragStart(e)}
    onDragEnd={(e) => this.onDragEnd(e)}
    style={styles.trackedScroll}
  >
    {/* Scrollable content */}
  </scroll>

  {/* Real-time metrics display */}
  <Card>
    <label value={`Position: ${this.state.scrollPosition.y.toFixed(0)}px`} />
    <label value={`Velocity: ${this.state.scrollVelocity.y.toFixed(0)}px/s`} />
    <label value={`Status: ${this.state.isScrolling ? 'Scrolling' : 'Stopped'}`} />
    <label value={`Dragging: ${this.state.isDragging ? 'Yes' : 'No'}`} />

    {/* Overscroll indicator */}
    {this.state.overscrollTension.y !== 0 && (
      <label
        value={`Overscroll: ${this.state.overscrollTension.y.toFixed(2)}`}
        color={Colors.warning}
      />
    )}
  </Card>
</DemoSection>
```

### 3. Paging & Snapping (1.5 hours)

**Features:**
- pagingEnabled for snap-to-page behavior
- Horizontal page carousel
- Page indicator dots
- Custom snap points using onDragEnding
- Current page tracking

**Example:**
```typescript
interface PagingState {
  currentPage: number;
  totalPages: number;
}

// Calculate current page from scroll position
onPageScroll(event: ScrollEvent) {
  const pageWidth = 300; // Match item width
  const currentPage = Math.round(event.offset.x / pageWidth);

  if (currentPage !== this.state.currentPage) {
    this.setState({ currentPage });
  }
}

// Optional: Custom snap behavior
onDragEnding(event: ScrollDragEndingEvent): ScrollOffset | undefined {
  // Return custom snap position, or undefined to use default behavior
  const pageWidth = 300;
  const targetPage = Math.round(event.targetOffset.x / pageWidth);

  return {
    x: targetPage * pageWidth,
    y: 0,
  };
}

<DemoSection title="Horizontal Paging">
  <scroll
    horizontal={true}
    pagingEnabled={true}
    onScroll={(e) => this.onPageScroll(e)}
    onDragEnding={(e) => this.onDragEnding(e)}
    style={styles.pageScroll}
  >
    <layout flexDirection="row">
      {Array.from({ length: this.state.totalPages }).map((_, i) => (
        <view key={i} style={styles.page}>
          <label value={`Page ${i + 1}`} font={Fonts.h1} />
          <label value="Swipe to see more" font={Fonts.body} />
        </view>
      ))}
    </layout>
  </scroll>

  {/* Page indicator dots */}
  <layout flexDirection="row" justifyContent="center" style={styles.pageIndicator}>
    {Array.from({ length: this.state.totalPages }).map((_, i) => (
      <view
        key={i}
        style={{
          ...styles.dot,
          backgroundColor: i === this.state.currentPage ? Colors.primary : Colors.gray300,
        }}
      />
    ))}
  </layout>
</DemoSection>
```

### 4. Programmatic Scrolling (1.5 hours)

**Features:**
- Scroll to specific position using contentOffsetX/Y
- Animated scrolling with animate()
- Scroll to top/bottom buttons
- Smooth scroll to specific item
- Jump vs animated scroll comparison

**State management:**
```typescript
interface ProgrammaticScrollState {
  targetScrollY: number;
  scrollToItemIndex?: number;
}

// Scroll to top (instant)
scrollToTop() {
  this.setState({ targetScrollY: 0 });
}

// Scroll to bottom (animated)
scrollToBottom() {
  const contentHeight = 2000; // Calculate from content
  const viewportHeight = 600;
  const maxScroll = contentHeight - viewportHeight;

  const options: PresetCurveAnimationOptions = {
    duration: 0.5,
    curve: AnimationCurve.EaseInOut,
  };

  this.animate(options, () => {
    this.setState({ targetScrollY: maxScroll });
  });
}

// Scroll to specific item
scrollToItem(index: number) {
  const itemHeight = 80;
  const targetY = index * itemHeight;

  const options: PresetCurveAnimationOptions = {
    duration: 0.3,
    curve: AnimationCurve.EaseOut,
  };

  this.animate(options, () => {
    this.setState({ targetScrollY: targetY });
  });
}
```

**UI structure:**
```typescript
<DemoSection title="Programmatic Scrolling">
  <scroll
    contentOffsetY={this.state.targetScrollY}
    style={styles.programmaticScroll}
  >
    {Array.from({ length: 30 }).map((_, i) => (
      <view key={i} style={styles.listItem}>
        <label value={`Item ${i + 1}`} />
        <Button
          title="Scroll Here"
          size="small"
          onTap={() => this.scrollToItem(i)}
        />
      </view>
    ))}
  </scroll>

  {/* Scroll controls */}
  <layout flexDirection="row" justifyContent="center">
    <Button
      title="↑ Top"
      variant="outline"
      onTap={() => this.scrollToTop()}
    />
    <Button
      title="↓ Bottom"
      variant="outline"
      onTap={() => this.scrollToBottom()}
    />
    <Button
      title="→ Item 15"
      variant="primary"
      onTap={() => this.scrollToItem(14)}
    />
  </layout>
</DemoSection>
```

### 5. Performance Optimization (1 hour)

**Features:**
- limitToViewport for rendering only visible items
- viewportExtension for preloading content
- Performance comparison (with/without optimization)
- Large list handling (100+ items)

**Example:**
```typescript
interface PerformanceState {
  useViewportLimit: boolean;
  viewportExtension: number;
  itemCount: number;
}

<DemoSection title="Performance Optimization">
  <layout>
    <label
      value="Rendering optimization for long lists"
      font={Fonts.body}
      color={Colors.textSecondary}
    />

    {/* Controls */}
    <layout flexDirection="row">
      <Button
        title={this.state.useViewportLimit ? "Limit: ON" : "Limit: OFF"}
        variant={this.state.useViewportLimit ? "primary" : "outline"}
        onTap={() => this.setState({ useViewportLimit: !this.state.useViewportLimit })}
      />
      <label value={`Extension: ${this.state.viewportExtension}px`} />
    </layout>

    <scroll
      limitToViewport={this.state.useViewportLimit}
      viewportExtensionTop={this.state.viewportExtension}
      viewportExtensionBottom={this.state.viewportExtension}
      style={styles.performanceScroll}
    >
      {Array.from({ length: this.state.itemCount }).map((_, i) => (
        <view key={i} style={styles.performanceItem}>
          <label value={`Item ${i + 1}`} />
          <label
            value={this.state.useViewportLimit ? "Optimized" : "Always rendered"}
            font={Fonts.caption}
            color={Colors.textSecondary}
          />
        </view>
      ))}
    </scroll>

    <label
      value={`Total items: ${this.state.itemCount}`}
      font={Fonts.caption}
      color={Colors.textSecondary}
    />
  </layout>
</DemoSection>
```

## State Management

```typescript
interface ScrollingDemoState {
  // Basic scrolling
  verticalBounces: boolean;
  horizontalBounces: boolean;

  // Scroll tracking
  scrollPosition: { x: number, y: number };
  scrollVelocity: { x: number, y: number };
  isScrolling: boolean;
  isDragging: boolean;
  overscrollTension: { x: number, y: number };

  // Paging
  currentPage: number;
  totalPages: number;

  // Programmatic scrolling
  targetScrollY: number;

  // Performance
  useViewportLimit: boolean;
  viewportExtension: number;
  itemCount: number;
}
```

## Code Examples to Include

### Scroll Event Handling
```typescript
private setupScrollTracking() {
  <scroll
    onScroll={(event: ScrollEvent) => {
      this.setState({
        scrollPosition: event.offset,
        scrollVelocity: event.velocity,
        overscrollTension: event.overscrollTension,
      });
    }}
    onScrollEnd={(event: ScrollEndEvent) => {
      console.log(`Scroll ended at ${event.offset.y}`);
      console.log(`Decelerated: ${event.decelerated}`);
      this.setState({ isScrolling: false });
    }}
    onDragStart={(event: ScrollEvent) => {
      this.setState({ isDragging: true });
    }}
    onDragEnd={(event: ScrollDragEndEvent) => {
      this.setState({ isDragging: false });
    }}
  >
    {/* Content */}
  </scroll>;
}
```

### Animated Programmatic Scrolling
```typescript
private scrollToPosition(targetY: number, animated: boolean = true) {
  if (animated) {
    const options: PresetCurveAnimationOptions = {
      duration: 0.4,
      curve: AnimationCurve.EaseInOut,
    };

    this.animate(options, () => {
      this.setState({ targetScrollY: targetY });
    });
  } else {
    // Instant scroll
    this.setState({ targetScrollY: targetY });
  }
}
```

### Custom Snap Points
```typescript
private handleDragEnding(event: ScrollDragEndingEvent): ScrollOffset | undefined {
  const itemHeight = 100;
  const targetIndex = Math.round(event.targetOffset.y / itemHeight);

  // Snap to nearest item
  return {
    x: event.targetOffset.x,
    y: targetIndex * itemHeight,
  };
}
```

## Performance Considerations

1. **Viewport Limiting**: Use `limitToViewport={true}` for lists with many items
2. **Viewport Extensions**: Set appropriate preload distances (e.g., 200-500px)
3. **Event Throttling**: Consider throttling onScroll events if doing expensive operations
4. **Content Size**: Keep individual list items lightweight
5. **Nested Scrolling**: Avoid when possible, can cause scroll conflicts

## Estimated Effort

- **Basic scrolling (vertical/horizontal)**: 1.5 hours
- **Scroll events & tracking**: 2 hours
- **Paging & snapping**: 1.5 hours
- **Programmatic scrolling**: 1.5 hours
- **Performance optimization**: 1 hour
- **Testing & polish**: 0.5 hours

**Total: 8 hours**

## Success Criteria

- [ ] Vertical scrolling works smoothly
- [ ] Horizontal scrolling demonstrated
- [ ] Bounce effects toggle working
- [ ] onScroll events fire with correct position/velocity
- [ ] onScrollEnd detects scroll completion
- [ ] Drag events (start/end) working
- [ ] Paging snaps to page boundaries
- [ ] Page indicator reflects current page
- [ ] Programmatic scroll to top/bottom functional
- [ ] Animated scrolling smooth and responsive
- [ ] Viewport limiting improves performance on long lists
- [ ] Custom snap points work with onDragEnding
- [ ] Works on both iOS and Android
- [ ] No jank or stuttering during scroll

## Advanced Features to Showcase

1. **Pull-to-Refresh Pattern**: Using onDragStart and overscrollTension
2. **Infinite Scroll**: Detecting scroll-to-bottom and loading more content
3. **Sticky Headers**: Using scroll position to show/hide header
4. **Parallax Effects**: Using scroll position for background animations
5. **Scroll-Based Animations**: Fade in/out elements based on scroll position

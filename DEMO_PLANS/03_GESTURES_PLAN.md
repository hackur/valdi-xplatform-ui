# Gestures Demo - Implementation Plan

## Overview
Demonstrate Valdi's comprehensive gesture system including touch, tap, long press, drag, pinch, and rotation gestures. Show how to track multi-touch gestures, velocity, and combine gestures for interactive UI elements.

## Valdi Capabilities Identified

### Gesture Event Types

#### TouchEvent (Base for all gestures)
```typescript
interface TouchEvent extends GestureEvent, Point {
  state: TouchEventState;  // Started = 0, Changed = 1, Ended = 2
  x: number;  // Position relative to element
  y: number;
  absoluteX: number;  // Position relative to screen
  absoluteY: number;
  pointerCount: number;  // Number of fingers touching
  pointerLocations: Pointer[];  // All touch points
}

enum TouchEventState {
  Started = 0,
  Changed = 1,
  Ended = 2,
}
```

#### DragEvent (Touch + movement tracking)
```typescript
interface DragEvent extends TouchEvent {
  deltaX: number;  // Distance from drag start
  deltaY: number;
  velocityX: number;  // Current velocity in px/s
  velocityY: number;
}
```

#### PinchEvent (Two-finger scaling)
```typescript
interface PinchEvent extends TouchEvent {
  scale: number;  // Scale factor (1.0 = no change, 2.0 = double size, 0.5 = half)
}
```

#### RotateEvent (Two-finger rotation)
```typescript
interface RotateEvent extends TouchEvent {
  rotation: number;  // Rotation in radians
}
```

### View Event Handlers
```typescript
interface View {
  onTouch?: (event: TouchEvent) => void;
  onTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  onDrag?: (event: DragEvent) => void;
  onPinch?: (event: PinchEvent) => void;
  onRotate?: (event: RotateEvent) => void;
}
```

## Implementation Sections

### 1. Touch & Tap Gestures (1.5 hours)

**Features to demonstrate:**
- onTouch event with state tracking (Started/Changed/Ended)
- onTap for single tap
- onLongPress for long press
- Touch position visualization
- Multi-touch tracking with pointerCount
- Touch state visualization

**Example structure:**
```typescript
interface TouchState {
  touchActive: boolean;
  touchPosition: { x: number, y: number };
  touchState: 'Started' | 'Changed' | 'Ended' | 'None';
  pointerCount: number;
  lastTapTime?: number;
  longPressActive: boolean;
}

private handleTouch(event: TouchEvent) {
  const stateNames = ['Started', 'Changed', 'Ended'];

  this.setState({
    touchActive: event.state !== TouchEventState.Ended,
    touchPosition: { x: event.x, y: event.y },
    touchState: stateNames[event.state] as any,
    pointerCount: event.pointerCount,
  });
}

private handleTap(event: TouchEvent) {
  this.setState({ lastTapTime: Date.now() });
  console.log(`Tapped at (${event.x}, ${event.y})`);
}

private handleLongPress(event: TouchEvent) {
  this.setState({ longPressActive: true });

  // Reset after animation
  setTimeout(() => {
    this.setState({ longPressActive: false });
  }, 500);
}

<DemoSection title="Touch & Tap">
  <Card>
    <view
      width="100%"
      height={200}
      backgroundColor={this.state.touchActive ? Colors.primary : Colors.gray100}
      borderRadius={BorderRadius.base}
      onTouch={(e) => this.handleTouch(e)}
      onTap={(e) => this.handleTap(e)}
      onLongPress={(e) => this.handleLongPress(e)}
    >
      <layout
        width="100%"
        height="100%"
        alignItems="center"
        justifyContent="center"
      >
        <label
          value={this.state.touchActive ? "Touching!" : "Touch Here"}
          font={Fonts.h2}
          color={this.state.touchActive ? Colors.white : Colors.text}
        />

        {/* Touch position indicator */}
        {this.state.touchActive && (
          <view
            width={20}
            height={20}
            backgroundColor={Colors.error}
            borderRadius={BorderRadius.full}
            position="absolute"
            left={this.state.touchPosition.x - 10}
            top={this.state.touchPosition.y - 10}
          />
        )}
      </layout>
    </view>

    {/* Touch info display */}
    <layout>
      <label value={`State: ${this.state.touchState}`} font={Fonts.body} />
      <label value={`Pointers: ${this.state.pointerCount}`} font={Fonts.body} />
      <label
        value={`Position: (${this.state.touchPosition.x.toFixed(0)}, ${this.state.touchPosition.y.toFixed(0)})`}
        font={Fonts.body}
      />
      {this.state.longPressActive && (
        <label value="🔆 Long Press Detected!" color={Colors.success} />
      )}
    </layout>
  </Card>
</DemoSection>
```

### 2. Drag Gesture with Velocity (2 hours)

**Features:**
- Draggable element
- Delta tracking (distance from start)
- Velocity display
- Constrain to bounds
- Momentum/inertia after release
- Reset to center button

**State management:**
```typescript
interface DragState {
  dragPosition: { x: number, y: number };
  dragDelta: { x: number, y: number };
  dragVelocity: { x: number, y: number };
  isDragging: boolean;
}

private handleDrag(event: DragEvent) {
  this.setState({
    isDragging: true,
    dragPosition: { x: event.x, y: event.y },
    dragDelta: { x: event.deltaX, y: event.deltaY },
    dragVelocity: { x: event.velocityX, y: event.velocityY },
  });

  // On drag end
  if (event.state === TouchEventState.Ended) {
    this.setState({ isDragging: false });

    // Apply momentum if velocity is high
    if (Math.abs(event.velocityX) > 500 || Math.abs(event.velocityY) > 500) {
      this.applyMomentum(event.velocityX, event.velocityY);
    }
  }
}

private applyMomentum(vx: number, vy: number) {
  // Animate to final position based on velocity
  const friction = 0.95;
  const timeStep = 16; // ms

  let currentVX = vx;
  let currentVY = vy;
  let currentX = this.state.dragDelta.x;
  let currentY = this.state.dragDelta.y;

  const animate = () => {
    currentVX *= friction;
    currentVY *= friction;
    currentX += (currentVX * timeStep) / 1000;
    currentY += (currentVY * timeStep) / 1000;

    this.setState({
      dragDelta: { x: currentX, y: currentY },
    });

    if (Math.abs(currentVX) > 10 || Math.abs(currentVY) > 10) {
      setTimeout(animate, timeStep);
    }
  };

  animate();
}

private resetDragPosition() {
  const options: PresetCurveAnimationOptions = {
    duration: 0.3,
    curve: AnimationCurve.EaseOut,
  };

  this.animate(options, () => {
    this.setState({ dragDelta: { x: 0, y: 0 } });
  });
}
```

**UI structure:**
```typescript
<DemoSection title="Drag Gesture">
  <Card>
    <view
      width="100%"
      height={300}
      backgroundColor={Colors.gray100}
      borderRadius={BorderRadius.base}
      overflow="visible"
    >
      {/* Draggable element */}
      <view
        width={80}
        height={80}
        backgroundColor={this.state.isDragging ? Colors.primary : Colors.secondary}
        borderRadius={BorderRadius.base}
        translationX={this.state.dragDelta.x}
        translationY={this.state.dragDelta.y}
        scaleX={this.state.isDragging ? 1.1 : 1}
        scaleY={this.state.isDragging ? 1.1 : 1}
        onDrag={(e) => this.handleDrag(e)}
        position="absolute"
        left={110}  // Center horizontally (assuming 300px width)
        top={110}   // Center vertically
      >
        <layout width="100%" height="100%" alignItems="center" justifyContent="center">
          <label value="Drag Me" font={Fonts.caption} color={Colors.white} />
        </layout>
      </view>
    </view>

    {/* Drag metrics */}
    <layout>
      <label
        value={`Delta: (${this.state.dragDelta.x.toFixed(0)}, ${this.state.dragDelta.y.toFixed(0)})`}
        font={Fonts.body}
      />
      <label
        value={`Velocity: (${this.state.dragVelocity.x.toFixed(0)}, ${this.state.dragVelocity.y.toFixed(0)}) px/s`}
        font={Fonts.body}
      />
      <Button
        title="Reset Position"
        variant="outline"
        onTap={() => this.resetDragPosition()}
      />
    </layout>
  </Card>
</DemoSection>
```

### 3. Pinch to Zoom (1.5 hours)

**Features:**
- Two-finger pinch gesture
- Scale value tracking
- Min/max scale constraints
- Visual feedback during pinch
- Reset to original size
- Smooth scaling animation

**Example:**
```typescript
interface PinchState {
  scale: number;
  isPinching: boolean;
  minScale: number;
  maxScale: number;
}

private handlePinch(event: PinchEvent) {
  // Constrain scale to min/max
  let newScale = event.scale;
  newScale = Math.max(this.state.minScale, newScale);
  newScale = Math.min(this.state.maxScale, newScale);

  this.setState({
    scale: newScale,
    isPinching: event.state !== TouchEventState.Ended,
  });
}

private resetScale() {
  const options: PresetCurveAnimationOptions = {
    duration: 0.3,
    curve: AnimationCurve.EaseInOut,
  };

  this.animate(options, () => {
    this.setState({ scale: 1 });
  });
}

<DemoSection title="Pinch to Zoom">
  <Card>
    <label
      value="Use two fingers to pinch"
      font={Fonts.caption}
      color={Colors.textSecondary}
    />

    <view
      width="100%"
      height={300}
      backgroundColor={Colors.gray100}
      borderRadius={BorderRadius.base}
      alignItems="center"
      justifyContent="center"
    >
      <view
        width={150}
        height={150}
        backgroundColor={Colors.primary}
        borderRadius={BorderRadius.base}
        scaleX={this.state.scale}
        scaleY={this.state.scale}
        opacity={this.state.isPinching ? 0.8 : 1}
        onPinch={(e) => this.handlePinch(e)}
      >
        <layout width="100%" height="100%" alignItems="center" justifyContent="center">
          <label
            value={`${(this.state.scale * 100).toFixed(0)}%`}
            font={Fonts.h2}
            color={Colors.white}
          />
        </layout>
      </view>
    </view>

    {/* Scale info */}
    <layout>
      <label
        value={`Scale: ${this.state.scale.toFixed(2)}x`}
        font={Fonts.body}
      />
      <label
        value={`Range: ${this.state.minScale}x - ${this.state.maxScale}x`}
        font={Fonts.caption}
        color={Colors.textSecondary}
      />
      <Button
        title="Reset Zoom"
        variant="outline"
        onTap={() => this.resetScale()}
      />
    </layout>
  </Card>
</DemoSection>
```

### 4. Rotation Gesture (1.5 hours)

**Features:**
- Two-finger rotation
- Rotation in radians (convert to degrees for display)
- Rotation constraints (optional)
- Visual rotation of element
- Snap to 90° increments button
- Reset rotation

**State management:**
```typescript
interface RotationState {
  rotation: number;  // In radians
  isRotating: boolean;
  snapToAngles: boolean;
}

private handleRotate(event: RotateEvent) {
  let newRotation = event.rotation;

  // Optional: Snap to 90-degree increments
  if (this.state.snapToAngles) {
    const degrees = (newRotation * 180) / Math.PI;
    const snappedDegrees = Math.round(degrees / 90) * 90;
    newRotation = (snappedDegrees * Math.PI) / 180;
  }

  this.setState({
    rotation: newRotation,
    isRotating: event.state !== TouchEventState.Ended,
  });
}

private resetRotation() {
  const options: PresetCurveAnimationOptions = {
    duration: 0.3,
    curve: AnimationCurve.EaseInOut,
  };

  this.animate(options, () => {
    this.setState({ rotation: 0 });
  });
}

private toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
```

**UI structure:**
```typescript
<DemoSection title="Rotation Gesture">
  <Card>
    <label
      value="Use two fingers to rotate"
      font={Fonts.caption}
      color={Colors.textSecondary}
    />

    <view
      width="100%"
      height={300}
      backgroundColor={Colors.gray100}
      borderRadius={BorderRadius.base}
      alignItems="center"
      justifyContent="center"
    >
      <view
        width={120}
        height={120}
        backgroundColor={Colors.secondary}
        borderRadius={BorderRadius.base}
        rotation={this.state.rotation}
        opacity={this.state.isRotating ? 0.8 : 1}
        onRotate={(e) => this.handleRotate(e)}
      >
        <layout width="100%" height="100%" alignItems="center" justifyContent="center">
          <label value="↑" font={Fonts.h1} color={Colors.white} />
          <label
            value={`${this.toDegrees(this.state.rotation).toFixed(0)}°`}
            font={Fonts.body}
            color={Colors.white}
          />
        </layout>
      </view>
    </view>

    {/* Rotation controls */}
    <layout>
      <label
        value={`Rotation: ${this.toDegrees(this.state.rotation).toFixed(1)}°`}
        font={Fonts.body}
      />
      <label
        value={`Radians: ${this.state.rotation.toFixed(2)}`}
        font={Fonts.caption}
        color={Colors.textSecondary}
      />
      <layout flexDirection="row">
        <Button
          title={this.state.snapToAngles ? "Snap: ON" : "Snap: OFF"}
          variant={this.state.snapToAngles ? "primary" : "outline"}
          size="small"
          onTap={() => this.setState({ snapToAngles: !this.state.snapToAngles })}
        />
        <Button
          title="Reset"
          variant="outline"
          size="small"
          onTap={() => this.resetRotation()}
        />
      </layout>
    </layout>
  </Card>
</DemoSection>
```

### 5. Combined Gestures (1.5 hours)

**Features:**
- Element that responds to drag + pinch + rotate simultaneously
- Transform matrix combining all gestures
- Interactive photo viewer simulation
- Double-tap to reset all transforms

**Example:**
```typescript
interface CombinedGestureState {
  position: { x: number, y: number };
  scale: number;
  rotation: number;
  lastTapTime?: number;
}

private handleDoubleTap(event: TouchEvent) {
  const now = Date.now();
  const timeSinceLastTap = this.state.lastTapTime
    ? now - this.state.lastTapTime
    : Infinity;

  if (timeSinceLastTap < 300) {
    // Double tap detected
    this.resetAllTransforms();
  }

  this.setState({ lastTapTime: now });
}

private resetAllTransforms() {
  const options: PresetCurveAnimationOptions = {
    duration: 0.3,
    curve: AnimationCurve.EaseOut,
  };

  this.animate(options, () => {
    this.setState({
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
    });
  });
}

<DemoSection title="Combined Gestures">
  <Card>
    <label
      value="Drag, pinch, and rotate this element. Double-tap to reset."
      font={Fonts.caption}
      color={Colors.textSecondary}
    />

    <view
      width="100%"
      height={400}
      backgroundColor={Colors.gray100}
      borderRadius={BorderRadius.base}
      alignItems="center"
      justifyContent="center"
    >
      <view
        width={200}
        height={150}
        backgroundColor={Colors.primary}
        borderRadius={BorderRadius.base}
        translationX={this.state.position.x}
        translationY={this.state.position.y}
        scaleX={this.state.scale}
        scaleY={this.state.scale}
        rotation={this.state.rotation}
        onDrag={(e) => this.handleDrag(e)}
        onPinch={(e) => this.handlePinch(e)}
        onRotate={(e) => this.handleRotate(e)}
        onTap={(e) => this.handleDoubleTap(e)}
      >
        <layout width="100%" height="100%" alignItems="center" justifyContent="center">
          <label value="🖼️" font={Fonts.h1} />
          <label value="Interactive" font={Fonts.body} color={Colors.white} />
        </layout>
      </view>
    </view>

    {/* Transform summary */}
    <layout>
      <label
        value={`Position: (${this.state.position.x.toFixed(0)}, ${this.state.position.y.toFixed(0)})`}
        font={Fonts.caption}
      />
      <label
        value={`Scale: ${this.state.scale.toFixed(2)}x`}
        font={Fonts.caption}
      />
      <label
        value={`Rotation: ${this.toDegrees(this.state.rotation).toFixed(0)}°`}
        font={Fonts.caption}
      />
      <Button
        title="Reset All"
        variant="primary"
        onTap={() => this.resetAllTransforms()}
      />
    </layout>
  </Card>
</DemoSection>
```

## State Management

```typescript
interface GesturesDemoState {
  // Touch & Tap
  touchActive: boolean;
  touchPosition: { x: number, y: number };
  touchState: 'Started' | 'Changed' | 'Ended' | 'None';
  pointerCount: number;
  lastTapTime?: number;
  longPressActive: boolean;

  // Drag
  dragPosition: { x: number, y: number };
  dragDelta: { x: number, y: number };
  dragVelocity: { x: number, y: number };
  isDragging: boolean;

  // Pinch
  scale: number;
  isPinching: boolean;
  minScale: number;
  maxScale: number;

  // Rotation
  rotation: number;
  isRotating: boolean;
  snapToAngles: boolean;

  // Combined
  combinedPosition: { x: number, y: number };
  combinedScale: number;
  combinedRotation: number;
}
```

## Code Examples to Include

### Touch State Tracking
```typescript
private handleTouch(event: TouchEvent) {
  const stateNames = ['Started', 'Changed', 'Ended'];

  this.setState({
    touchActive: event.state !== TouchEventState.Ended,
    touchPosition: { x: event.x, y: event.y },
    touchState: stateNames[event.state] as any,
    pointerCount: event.pointerCount,
  });

  console.log(`Touch ${stateNames[event.state]} at (${event.x}, ${event.y})`);
  console.log(`Pointers: ${event.pointerCount}`);
}
```

### Velocity-Based Momentum
```typescript
private applyMomentum(velocityX: number, velocityY: number) {
  const friction = 0.95;
  const threshold = 10; // Stop when velocity below this

  let vx = velocityX;
  let vy = velocityY;
  let x = this.state.dragDelta.x;
  let y = this.state.dragDelta.y;

  const step = () => {
    vx *= friction;
    vy *= friction;
    x += (vx * 16) / 1000;  // 16ms per frame
    y += (vy * 16) / 1000;

    this.setState({ dragDelta: { x, y } });

    if (Math.abs(vx) > threshold || Math.abs(vy) > threshold) {
      setTimeout(step, 16);
    }
  };

  step();
}
```

## Performance Considerations

1. **Event Throttling**: Consider throttling touch events if doing expensive operations
2. **Transform Performance**: Use scaleX/Y, rotation, translationX/Y (GPU-accelerated) instead of width/height/position
3. **Gesture Conflicts**: Be aware of gesture priority (drag vs scroll, etc.)
4. **Multi-Touch**: Test with actual devices for accurate multi-touch behavior
5. **Hit Testing**: Ensure gesture-enabled elements have adequate touch targets (min 44x44)

## Estimated Effort

- **Touch & Tap gestures**: 1.5 hours
- **Drag with velocity**: 2 hours
- **Pinch to zoom**: 1.5 hours
- **Rotation gesture**: 1.5 hours
- **Combined gestures**: 1.5 hours
- **Testing & polish**: 1 hour

**Total: 9 hours**

## Success Criteria

- [ ] Touch events fire with correct state (Started/Changed/Ended)
- [ ] Tap and long press detected correctly
- [ ] Touch position tracking accurate
- [ ] Multi-touch pointer count displayed
- [ ] Drag gesture smooth with delta tracking
- [ ] Velocity calculated correctly
- [ ] Momentum/inertia feels natural
- [ ] Pinch gesture scales element
- [ ] Scale constraints (min/max) enforced
- [ ] Rotation gesture rotates element correctly
- [ ] Radians to degrees conversion accurate
- [ ] Combined gestures work simultaneously
- [ ] Double-tap to reset functional
- [ ] All animations smooth (60fps)
- [ ] Works on both iOS and Android
- [ ] No gesture conflicts or unexpected behavior

## Advanced Features to Showcase

1. **Custom Gesture Recognizers**: Combining touch states for custom patterns
2. **Gesture Sequence Detection**: Swipe patterns, shake detection
3. **Boundary Constraints**: Keeping dragged elements within bounds
4. **Snap Points**: Snapping to grid or specific positions
5. **Gesture Cancellation**: Handling gesture interruptions gracefully

/**
 * GesturesDemo Component
 * Demonstrates Valdi's comprehensive gesture system including touch, tap, long press,
 * drag, pinch, and rotation gestures with real-time event data display.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import {
  TouchEvent,
  DragEvent,
  PinchEvent,
  RotateEvent,
  TouchEventState,
} from 'valdi_core/src/GestureEvent';

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
  AnimationDurations,
} from '../../common/src/index';

export interface GesturesDemoViewModel {
  navigationController: NavigationController;
}

interface GesturesDemoState {
  // Touch & Tap
  touchActive: boolean;
  touchPosition: { x: number; y: number };
  touchState: 'Started' | 'Changed' | 'Ended' | 'None';
  pointerCount: number;
  lastTapTime?: number;
  longPressActive: boolean;

  // Drag
  dragPosition: { x: number; y: number };
  dragDelta: { x: number; y: number };
  dragVelocity: { x: number; y: number };
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
  combinedPosition: { x: number; y: number };
  combinedScale: number;
  combinedRotation: number;
  lastCombinedTapTime?: number;
}

@NavigationPage(module)
export class GesturesDemo extends StatefulComponent<GesturesDemoViewModel, GesturesDemoState> {
  state: GesturesDemoState = {
    // Touch & Tap
    touchActive: false,
    touchPosition: { x: 0, y: 0 },
    touchState: 'None',
    pointerCount: 0,
    longPressActive: false,

    // Drag
    dragPosition: { x: 0, y: 0 },
    dragDelta: { x: 0, y: 0 },
    dragVelocity: { x: 0, y: 0 },
    isDragging: false,

    // Pinch
    scale: 1,
    isPinching: false,
    minScale: 0.5,
    maxScale: 3,

    // Rotation
    rotation: 0,
    isRotating: false,
    snapToAngles: false,

    // Combined
    combinedPosition: { x: 0, y: 0 },
    combinedScale: 1,
    combinedRotation: 0,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Gestures"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Touch & Tap Gestures */}
          <DemoSection
            title="Touch & Tap"
            description="Track touch events with state, position, and multi-touch support"
          >
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
                    value={this.state.touchActive ? 'Touching!' : 'Touch Here'}
                    font={Fonts.h2}
                    color={this.state.touchActive ? Colors.white : Colors.textPrimary}
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
              <layout gap={Spacing.xs}>
                <label
                  value={`State: ${this.state.touchState}`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />
                <label
                  value={`Pointers: ${this.state.pointerCount}`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />
                <label
                  value={`Position: (${this.state.touchPosition.x.toFixed(0)}, ${this.state.touchPosition.y.toFixed(0)})`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />
                {this.state.longPressActive && (
                  <label
                    value="Long Press Detected!"
                    font={Fonts.body}
                    color={Colors.success}
                  />
                )}
              </layout>
            </Card>
          </DemoSection>

          {/* Drag Gesture */}
          <DemoSection
            title="Drag Gesture"
            description="Drag with velocity tracking and momentum physics"
          >
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
                  left={110}
                  top={110}
                >
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label value="Drag Me" font={Fonts.caption} color={Colors.white} />
                  </layout>
                </view>
              </view>

              {/* Drag metrics */}
              <layout gap={Spacing.xs}>
                <label
                  value={`Delta: (${this.state.dragDelta.x.toFixed(0)}, ${this.state.dragDelta.y.toFixed(0)})`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />
                <label
                  value={`Velocity: (${this.state.dragVelocity.x.toFixed(0)}, ${this.state.dragVelocity.y.toFixed(0)}) px/s`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />
                <Button
                  title="Reset Position"
                  variant="outline"
                  onTap={() => this.resetDragPosition()}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Pinch to Zoom */}
          <DemoSection
            title="Pinch to Zoom"
            description="Two-finger pinch gesture with scale constraints"
          >
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
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label
                      value={`${(this.state.scale * 100).toFixed(0)}%`}
                      font={Fonts.h2}
                      color={Colors.white}
                    />
                  </layout>
                </view>
              </view>

              {/* Scale info */}
              <layout gap={Spacing.xs}>
                <label
                  value={`Scale: ${this.state.scale.toFixed(2)}x`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
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

          {/* Rotation Gesture */}
          <DemoSection
            title="Rotation Gesture"
            description="Two-finger rotation with angle snapping"
          >
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
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
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
              <layout gap={Spacing.xs}>
                <label
                  value={`Rotation: ${this.toDegrees(this.state.rotation).toFixed(1)}°`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />
                <label
                  value={`Radians: ${this.state.rotation.toFixed(2)}`}
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                />
                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title={this.state.snapToAngles ? 'Snap: ON' : 'Snap: OFF'}
                    variant={this.state.snapToAngles ? 'primary' : 'outline'}
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

          {/* Combined Gestures */}
          <DemoSection
            title="Combined Gestures"
            description="Drag, pinch, and rotate simultaneously. Double-tap to reset."
          >
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
                  translationX={this.state.combinedPosition.x}
                  translationY={this.state.combinedPosition.y}
                  scaleX={this.state.combinedScale}
                  scaleY={this.state.combinedScale}
                  rotation={this.state.combinedRotation}
                  onDrag={(e) => this.handleCombinedDrag(e)}
                  onPinch={(e) => this.handleCombinedPinch(e)}
                  onRotate={(e) => this.handleCombinedRotate(e)}
                  onTap={(e) => this.handleDoubleTap(e)}
                >
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label value="Interactive" font={Fonts.body} color={Colors.white} />
                  </layout>
                </view>
              </view>

              {/* Transform summary */}
              <layout gap={Spacing.xs}>
                <label
                  value={`Position: (${this.state.combinedPosition.x.toFixed(0)}, ${this.state.combinedPosition.y.toFixed(0)})`}
                  font={Fonts.caption}
                  color={Colors.textPrimary}
                />
                <label
                  value={`Scale: ${this.state.combinedScale.toFixed(2)}x`}
                  font={Fonts.caption}
                  color={Colors.textPrimary}
                />
                <label
                  value={`Rotation: ${this.toDegrees(this.state.combinedRotation).toFixed(0)}°`}
                  font={Fonts.caption}
                  color={Colors.textPrimary}
                />
                <Button
                  title="Reset All"
                  variant="primary"
                  onTap={() => this.resetAllTransforms()}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Touch & Tap gestures
<view
  onTouch={(e: TouchEvent) => {
    console.log('State:', e.state);
    console.log('Position:', e.x, e.y);
    console.log('Pointers:', e.pointerCount);
  }}
  onTap={(e) => console.log('Tapped!')}
  onLongPress={(e) => console.log('Long press')}
>
  <label value="Touch me" />
</view>

// Drag with velocity
<view
  onDrag={(e: DragEvent) => {
    console.log('Delta:', e.deltaX, e.deltaY);
    console.log('Velocity:', e.velocityX, e.velocityY);
    this.setState({
      x: e.deltaX,
      y: e.deltaY
    });
  }}
>
  <label value="Drag me" />
</view>

// Pinch & Rotate
<view
  onPinch={(e: PinchEvent) => {
    this.setState({ scale: e.scale });
  }}
  onRotate={(e: RotateEvent) => {
    this.setState({ rotation: e.rotation });
  }}
>
  <label value="Pinch & rotate" />
</view>`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // Touch & Tap handlers
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

  // Drag handlers
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
    const threshold = 10;
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

      if (Math.abs(currentVX) > threshold || Math.abs(currentVY) > threshold) {
        setTimeout(animate, timeStep);
      }
    };

    animate();
  }

  private resetDragPosition() {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeOut' }, () => {
      this.setState({ dragDelta: { x: 0, y: 0 } });
    });
  }

  // Pinch handlers
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
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ scale: 1 });
    });
  }

  // Rotation handlers
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
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ rotation: 0 });
    });
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  // Combined gesture handlers
  private handleCombinedDrag(event: DragEvent) {
    this.setState({
      combinedPosition: { x: event.deltaX, y: event.deltaY },
    });
  }

  private handleCombinedPinch(event: PinchEvent) {
    // Constrain scale
    let newScale = event.scale;
    newScale = Math.max(this.state.minScale, newScale);
    newScale = Math.min(this.state.maxScale, newScale);

    this.setState({
      combinedScale: newScale,
    });
  }

  private handleCombinedRotate(event: RotateEvent) {
    this.setState({
      combinedRotation: event.rotation,
    });
  }

  private handleDoubleTap(event: TouchEvent) {
    const now = Date.now();
    const timeSinceLastTap = this.state.lastCombinedTapTime
      ? now - this.state.lastCombinedTapTime
      : Infinity;

    if (timeSinceLastTap < 300) {
      // Double tap detected
      this.resetAllTransforms();
    }

    this.setState({ lastCombinedTapTime: now });
  }

  private resetAllTransforms() {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeOut' }, () => {
      this.setState({
        combinedPosition: { x: 0, y: 0 },
        combinedScale: 1,
        combinedRotation: 0,
      });
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
};

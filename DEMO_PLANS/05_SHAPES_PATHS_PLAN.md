# Shapes & Paths Demo - Implementation Plan

## Overview
Demonstrate Valdi's vector graphics capabilities using GeometricPathBuilder and ShapeView. Show how to create custom shapes, draw paths, use stroke and fill, create curves, and animate path properties.

## Valdi Capabilities Identified

### GeometricPathBuilder
```typescript
export class GeometricPathBuilder {
  constructor(extentWidth: number, extentHeight: number, scaleType?: GeometricPathScaleType);

  // Basic path commands
  moveTo(x: number, y: number): GeometricPathBuilder;
  lineTo(x: number, y: number): GeometricPathBuilder;
  close(): GeometricPathBuilder;

  // Shapes
  rectTo(x: number, y: number, width: number, height: number): GeometricPathBuilder;
  roundRectTo(x: number, y: number, width: number, height: number, radiusX: number, radiusY: number): GeometricPathBuilder;
  ovalTo(x: number, y: number, width: number, height: number): GeometricPathBuilder;

  // Arcs and curves
  arcTo(centerX: number, centerY: number, radius: number, startAngle: number, sweepAngle: number): GeometricPathBuilder;
  cubicTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, x: number, y: number): GeometricPathBuilder;
  quadTo(controlX: number, controlY: number, x: number, y: number): GeometricPathBuilder;

  // Build final path
  build(): GeometricPath;
}

export type GeometricPathScaleType =
  | 'fill'      // Stretch to fill
  | 'contain'   // Fit within bounds, preserve aspect ratio
  | 'cover'     // Fill bounds, preserve aspect ratio (may crop)
  | 'none';     // No scaling
```

### ShapeView
```typescript
interface ShapeView {
  path?: GeometricPath;

  // Stroke properties
  strokeWidth?: number;
  strokeColor?: Color;
  strokeCap?: ShapeStrokeCap;    // 'butt' | 'round' | 'square'
  strokeJoin?: ShapeStrokeJoin;  // 'bevel' | 'miter' | 'round'
  strokeStart?: number;  // 0-1, animatable for path animation
  strokeEnd?: number;    // 0-1, animatable for path animation

  // Fill properties
  fillColor?: Color;
}
```

## Implementation Sections

### 1. Basic Shapes & Path Building (2 hours)

**Features to demonstrate:**
- Rectangle (rectTo)
- Rounded rectangle (roundRectTo)
- Circle/Oval (ovalTo)
- Triangle (using moveTo, lineTo, close)
- Star shape (custom path)
- Path coordinate system explanation

**Example structure:**
```typescript
interface ShapesState {
  selectedShape: 'rectangle' | 'roundedRect' | 'circle' | 'triangle' | 'star';
}

private createRectanglePath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  return builder
    .rectTo(10, 10, 80, 80)
    .build();
}

private createRoundedRectPath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  return builder
    .roundRectTo(10, 10, 80, 80, 20, 20)
    .build();
}

private createCirclePath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  return builder
    .ovalTo(10, 10, 80, 80)
    .build();
}

private createTrianglePath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  return builder
    .moveTo(50, 10)      // Top point
    .lineTo(90, 90)      // Bottom right
    .lineTo(10, 90)      // Bottom left
    .close()             // Close path back to start
    .build();
}

private createStarPath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;

  builder.moveTo(centerX, centerY - outerRadius);

  for (let i = 1; i <= points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    builder.lineTo(x, y);
  }

  return builder.close().build();
}

<DemoSection title="Basic Shapes">
  <Card>
    <layout>
      {/* Shape selector */}
      <layout flexDirection="row" flexWrap="wrap">
        <Button
          title="Rectangle"
          variant={this.state.selectedShape === 'rectangle' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.setState({ selectedShape: 'rectangle' })}
        />
        <Button
          title="Rounded"
          variant={this.state.selectedShape === 'roundedRect' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.setState({ selectedShape: 'roundedRect' })}
        />
        <Button
          title="Circle"
          variant={this.state.selectedShape === 'circle' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.setState({ selectedShape: 'circle' })}
        />
        <Button
          title="Triangle"
          variant={this.state.selectedShape === 'triangle' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.setState({ selectedShape: 'triangle' })}
        />
        <Button
          title="Star"
          variant={this.state.selectedShape === 'star' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.setState({ selectedShape: 'star' })}
        />
      </layout>

      {/* Shape display */}
      <shape
        width={150}
        height={150}
        path={this.getShapePath(this.state.selectedShape)}
        fillColor={Colors.primary}
        strokeColor={Colors.secondary}
        strokeWidth={2}
      />
    </layout>
  </Card>
</DemoSection>
```

### 2. Stroke vs Fill Properties (1.5 hours)

**Features:**
- Stroke only (no fill)
- Fill only (no stroke)
- Both stroke and fill
- Stroke width variations
- Stroke cap styles (butt, round, square)
- Stroke join styles (bevel, miter, round)

**State management:**
```typescript
interface StrokeState {
  showStroke: boolean;
  showFill: boolean;
  strokeWidth: number;
  strokeCap: ShapeStrokeCap;
  strokeJoin: ShapeStrokeJoin;
}

private createPathForStrokeDemo(): GeometricPath {
  const builder = new GeometricPathBuilder(150, 150, 'contain');
  return builder
    .moveTo(20, 20)
    .lineTo(130, 50)
    .lineTo(80, 130)
    .lineTo(40, 100)
    .close()
    .build();
}
```

**UI structure:**
```typescript
<DemoSection title="Stroke vs Fill">
  <Card>
    <layout>
      {/* Stroke/Fill toggles */}
      <layout flexDirection="row">
        <Button
          title={this.state.showStroke ? "Stroke: ON" : "Stroke: OFF"}
          variant={this.state.showStroke ? 'primary' : 'outline'}
          onTap={() => this.setState({ showStroke: !this.state.showStroke })}
        />
        <Button
          title={this.state.showFill ? "Fill: ON" : "Fill: OFF"}
          variant={this.state.showFill ? 'primary' : 'outline'}
          onTap={() => this.setState({ showFill: !this.state.showFill })}
        />
      </layout>

      {/* Shape with controls */}
      <shape
        width={150}
        height={150}
        path={this.createPathForStrokeDemo()}
        strokeColor={this.state.showStroke ? Colors.primary : undefined}
        strokeWidth={this.state.strokeWidth}
        strokeCap={this.state.strokeCap}
        strokeJoin={this.state.strokeJoin}
        fillColor={this.state.showFill ? Colors.secondary : undefined}
      />

      {/* Stroke width control */}
      {this.state.showStroke && (
        <layout>
          <label value={`Stroke Width: ${this.state.strokeWidth}px`} font={Fonts.body} />
          <layout flexDirection="row">
            {[1, 2, 4, 8, 12].map(width => (
              <Button
                key={width}
                title={`${width}px`}
                variant={this.state.strokeWidth === width ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ strokeWidth: width })}
              />
            ))}
          </layout>

          {/* Stroke cap */}
          <label value="Stroke Cap" font={Fonts.body} />
          <layout flexDirection="row">
            {['butt', 'round', 'square'].map(cap => (
              <Button
                key={cap}
                title={cap}
                variant={this.state.strokeCap === cap ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ strokeCap: cap as ShapeStrokeCap })}
              />
            ))}
          </layout>

          {/* Stroke join */}
          <label value="Stroke Join" font={Fonts.body} />
          <layout flexDirection="row">
            {['bevel', 'miter', 'round'].map(join => (
              <Button
                key={join}
                title={join}
                variant={this.state.strokeJoin === join ? 'primary' : 'outline'}
                size="small"
                onTap={() => this.setState({ strokeJoin: join as ShapeStrokeJoin })}
              />
            ))}
          </layout>
        </layout>
      )}
    </layout>
  </Card>
</DemoSection>
```

### 3. Bezier Curves & Arcs (2 hours)

**Features:**
- Quadratic curves (quadTo)
- Cubic curves (cubicTo)
- Arcs (arcTo)
- Interactive control points
- Comparison of different curve types
- Smooth vs sharp curves

**Example:**
```typescript
interface CurveState {
  curveType: 'quad' | 'cubic' | 'arc';
  controlPoint1: { x: number, y: number };
  controlPoint2: { x: number, y: number };
  arcAngle: number;
}

private createQuadraticCurve(): GeometricPath {
  const builder = new GeometricPathBuilder(200, 200, 'contain');
  const cp = this.state.controlPoint1;

  return builder
    .moveTo(20, 180)
    .quadTo(cp.x, cp.y, 180, 180)
    .build();
}

private createCubicCurve(): GeometricPath {
  const builder = new GeometricPathBuilder(200, 200, 'contain');
  const cp1 = this.state.controlPoint1;
  const cp2 = this.state.controlPoint2;

  return builder
    .moveTo(20, 180)
    .cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, 180, 180)
    .build();
}

private createArcPath(): GeometricPath {
  const builder = new GeometricPathBuilder(200, 200, 'contain');

  return builder
    .moveTo(100, 20)
    .arcTo(100, 100, 80, -Math.PI / 2, this.state.arcAngle)
    .build();
}

<DemoSection title="Bezier Curves & Arcs">
  <Card>
    <layout>
      {/* Curve type selector */}
      <layout flexDirection="row">
        <Button
          title="Quadratic"
          variant={this.state.curveType === 'quad' ? 'primary' : 'outline'}
          onTap={() => this.setState({ curveType: 'quad' })}
        />
        <Button
          title="Cubic"
          variant={this.state.curveType === 'cubic' ? 'primary' : 'outline'}
          onTap={() => this.setState({ curveType: 'cubic' })}
        />
        <Button
          title="Arc"
          variant={this.state.curveType === 'arc' ? 'primary' : 'outline'}
          onTap={() => this.setState({ curveType: 'arc' })}
        />
      </layout>

      {/* Curve display */}
      <view
        width={220}
        height={220}
        backgroundColor={Colors.gray100}
        borderRadius={BorderRadius.base}
      >
        <shape
          width={200}
          height={200}
          path={this.getCurvePath(this.state.curveType)}
          strokeColor={Colors.primary}
          strokeWidth={3}
          strokeCap="round"
        />

        {/* Control points visualization */}
        {this.state.curveType === 'quad' && (
          <view
            width={8}
            height={8}
            backgroundColor={Colors.error}
            borderRadius={BorderRadius.full}
            position="absolute"
            left={this.state.controlPoint1.x - 4 + 10}
            top={this.state.controlPoint1.y - 4 + 10}
          />
        )}

        {this.state.curveType === 'cubic' && (
          <>
            <view
              width={8}
              height={8}
              backgroundColor={Colors.error}
              borderRadius={BorderRadius.full}
              position="absolute"
              left={this.state.controlPoint1.x - 4 + 10}
              top={this.state.controlPoint1.y - 4 + 10}
            />
            <view
              width={8}
              height={8}
              backgroundColor={Colors.warning}
              borderRadius={BorderRadius.full}
              position="absolute"
              left={this.state.controlPoint2.x - 4 + 10}
              top={this.state.controlPoint2.y - 4 + 10}
            />
          </>
        )}
      </view>

      {/* Arc angle control */}
      {this.state.curveType === 'arc' && (
        <layout>
          <label
            value={`Arc Angle: ${(this.state.arcAngle * 180 / Math.PI).toFixed(0)}°`}
            font={Fonts.body}
          />
          <layout flexDirection="row" flexWrap="wrap">
            {[90, 180, 270, 360].map(degrees => {
              const radians = (degrees * Math.PI) / 180;
              return (
                <Button
                  key={degrees}
                  title={`${degrees}°`}
                  variant="outline"
                  size="small"
                  onTap={() => this.setState({ arcAngle: radians })}
                />
              );
            })}
          </layout>
        </layout>
      )}
    </layout>
  </Card>
</DemoSection>
```

### 4. Path Animation (Stroke Trimming) (2 hours)

**Features:**
- strokeStart/strokeEnd animation
- Drawing line effect (0 to 1)
- Reveal animation
- Loading spinner using path animation
- Animated percentage indicator

**State management:**
```typescript
interface PathAnimationState {
  strokeStart: number;
  strokeEnd: number;
  isAnimating: boolean;
}

private animatePathDraw() {
  this.setState({ isAnimating: true, strokeEnd: 0 });

  const options: PresetCurveAnimationOptions = {
    duration: 2,
    curve: AnimationCurve.EaseInOut,
  };

  this.animate(options, () => {
    this.setState({ strokeEnd: 1 }, () => {
      this.setState({ isAnimating: false });
    });
  });
}

private createCheckmarkPath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  return builder
    .moveTo(20, 50)
    .lineTo(40, 70)
    .lineTo(80, 30)
    .build();
}

private createCircleLoaderPath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  return builder
    .arcTo(50, 50, 40, 0, Math.PI * 2)
    .build();
}
```

**UI structure:**
```typescript
<DemoSection title="Path Animation">
  <Card>
    <layout>
      <label value="Stroke Trimming Animation" font={Fonts.h3} />

      {/* Checkmark animation */}
      <view
        width={120}
        height={120}
        backgroundColor={Colors.gray100}
        borderRadius={BorderRadius.base}
        alignItems="center"
        justifyContent="center"
      >
        <shape
          width={100}
          height={100}
          path={this.createCheckmarkPath()}
          strokeColor={Colors.success}
          strokeWidth={8}
          strokeCap="round"
          strokeJoin="round"
          strokeStart={this.state.strokeStart}
          strokeEnd={this.state.strokeEnd}
        />
      </view>

      {/* Controls */}
      <layout flexDirection="row">
        <Button
          title="Animate Draw"
          variant="primary"
          onTap={() => this.animatePathDraw()}
          disabled={this.state.isAnimating}
        />
        <Button
          title="Reset"
          variant="outline"
          onTap={() => this.setState({ strokeStart: 0, strokeEnd: 0 })}
        />
      </layout>

      {/* Manual trim controls */}
      <label value="Manual Trim Control" font={Fonts.h3} />
      <label
        value={`Start: ${(this.state.strokeStart * 100).toFixed(0)}% | End: ${(this.state.strokeEnd * 100).toFixed(0)}%`}
        font={Fonts.body}
      />

      {/* Loading spinner example */}
      <label value="Animated Loader" font={Fonts.h3} />
      <view
        width={80}
        height={80}
        rotation={this.state.spinnerRotation}
      >
        <shape
          width={80}
          height={80}
          path={this.createCircleLoaderPath()}
          strokeColor={Colors.primary}
          strokeWidth={6}
          strokeCap="round"
          strokeStart={0}
          strokeEnd={0.75}
        />
      </view>
    </layout>
  </Card>
</DemoSection>
```

### 5. Complex Shapes & Scale Types (1.5 hours)

**Features:**
- Heart shape
- Arrow shape
- Wave/sine curve
- Scale type comparison (fill, contain, cover, none)
- Combined shapes (multiple paths)

**Example:**
```typescript
private createHeartPath(): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');

  return builder
    .moveTo(50, 80)
    // Left curve
    .cubicTo(20, 60, 20, 40, 35, 30)
    .cubicTo(40, 25, 50, 30, 50, 40)
    // Right curve
    .cubicTo(50, 30, 60, 25, 65, 30)
    .cubicTo(80, 40, 80, 60, 50, 80)
    .close()
    .build();
}

private createWavePath(): GeometricPath {
  const builder = new GeometricPathBuilder(200, 100, 'contain');
  const wavelength = 50;
  const amplitude = 20;
  const y0 = 50;

  builder.moveTo(0, y0);

  for (let x = 0; x <= 200; x += 5) {
    const y = y0 + amplitude * Math.sin((x / wavelength) * Math.PI * 2);
    builder.lineTo(x, y);
  }

  return builder.build();
}

<DemoSection title="Complex Shapes">
  <Card>
    <layout>
      {/* Heart shape */}
      <label value="Heart Shape" font={Fonts.h3} />
      <shape
        width={100}
        height={100}
        path={this.createHeartPath()}
        fillColor={Colors.error}
      />

      {/* Wave */}
      <label value="Wave (Sine Curve)" font={Fonts.h3} />
      <shape
        width={220}
        height={100}
        path={this.createWavePath()}
        strokeColor={Colors.primary}
        strokeWidth={3}
        strokeCap="round"
        strokeJoin="round"
      />

      {/* Scale type comparison */}
      <label value="Scale Types" font={Fonts.h3} />
      <layout flexDirection="row" flexWrap="wrap">
        {['fill', 'contain', 'cover', 'none'].map(scaleType => (
          <view key={scaleType} margin={Spacing.xs}>
            <label
              value={scaleType}
              font={Fonts.caption}
              color={Colors.textSecondary}
            />
            <view
              width={80}
              height={80}
              backgroundColor={Colors.gray100}
              borderRadius={BorderRadius.base}
            >
              <shape
                width={80}
                height={80}
                path={this.createScaledPath(scaleType as GeometricPathScaleType)}
                fillColor={Colors.secondary}
              />
            </view>
          </view>
        ))}
      </layout>
    </layout>
  </Card>
</DemoSection>
```

## State Management

```typescript
interface ShapesDemoState {
  // Basic shapes
  selectedShape: 'rectangle' | 'roundedRect' | 'circle' | 'triangle' | 'star';

  // Stroke/Fill
  showStroke: boolean;
  showFill: boolean;
  strokeWidth: number;
  strokeCap: ShapeStrokeCap;
  strokeJoin: ShapeStrokeJoin;

  // Curves
  curveType: 'quad' | 'cubic' | 'arc';
  controlPoint1: { x: number, y: number };
  controlPoint2: { x: number, y: number };
  arcAngle: number;

  // Path animation
  strokeStart: number;
  strokeEnd: number;
  isAnimating: boolean;
  spinnerRotation: number;
}
```

## Code Examples to Include

### Star Path Generator
```typescript
private createStarPath(points: number = 5, outerRadius: number = 40, innerRadius: number = 20): GeometricPath {
  const builder = new GeometricPathBuilder(100, 100, 'contain');
  const centerX = 50;
  const centerY = 50;

  builder.moveTo(centerX, centerY - outerRadius);

  for (let i = 1; i <= points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    builder.lineTo(x, y);
  }

  return builder.close().build();
}
```

### Continuous Rotation Animation
```typescript
private startSpinnerAnimation() {
  const rotate = () => {
    this.setState({
      spinnerRotation: (this.state.spinnerRotation + 0.1) % (Math.PI * 2)
    });

    if (this.state.isAnimating) {
      requestAnimationFrame(rotate);
    }
  };

  this.setState({ isAnimating: true });
  requestAnimationFrame(rotate);
}
```

## Performance Considerations

1. **Path Complexity**: Complex paths with many points may impact rendering performance
2. **Animation**: Animating strokeStart/strokeEnd is performant (GPU-accelerated)
3. **Path Rebuilding**: Avoid rebuilding paths every frame - cache when possible
4. **Scale Types**: 'contain' and 'cover' require aspect ratio calculations
5. **Multiple Shapes**: Rendering many shapes simultaneously may impact performance

## Estimated Effort

- **Basic shapes & path building**: 2 hours
- **Stroke vs fill properties**: 1.5 hours
- **Bezier curves & arcs**: 2 hours
- **Path animation (stroke trimming)**: 2 hours
- **Complex shapes & scale types**: 1.5 hours
- **Testing & polish**: 1 hour

**Total: 10 hours**

## Success Criteria

- [ ] Basic shapes render correctly (rect, roundedRect, circle, triangle, star)
- [ ] Custom paths can be created with moveTo, lineTo, close
- [ ] Stroke-only and fill-only modes work
- [ ] Stroke width adjustable
- [ ] Stroke cap styles (butt, round, square) visible
- [ ] Stroke join styles (bevel, miter, round) visible
- [ ] Quadratic curves render correctly
- [ ] Cubic curves render correctly
- [ ] Arcs render correctly
- [ ] strokeStart/strokeEnd animation smooth
- [ ] Path drawing effect works
- [ ] Animated loader spins continuously
- [ ] Complex shapes (heart, wave) render correctly
- [ ] All scale types (fill, contain, cover, none) demonstrated
- [ ] Works on both iOS and Android
- [ ] No performance issues with animated paths

## Advanced Techniques to Showcase

1. **Morphing Shapes**: Animating between two different paths
2. **Dashed Lines**: Using strokeStart/strokeEnd creatively
3. **Progress Indicators**: Circular progress with path trimming
4. **Custom Icons**: Creating icon set with paths
5. **Signature Drawing**: Capturing touch path and rendering

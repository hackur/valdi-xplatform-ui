/**
 * ShapesDemo Component
 * Demonstrates Valdi's vector graphics capabilities using GeometricPathBuilder and ShapeView.
 * Shows how to create custom shapes, draw paths, use stroke and fill, create curves, and animate path properties.
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { GeometricPathBuilder, GeometricPath } from 'valdi_core/src/GeometricPath';
import { AnimationCurve, PresetCurveAnimationOptions } from 'valdi_core/src/Animation';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView, Shape } from 'valdi_tsx/src/NativeTemplateElements';

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

export interface ShapesDemoViewModel {
  navigationController: NavigationController;
}

type ShapeStrokeCap = 'butt' | 'round' | 'square';
type ShapeStrokeJoin = 'bevel' | 'miter' | 'round';
type BasicShapeType = 'rectangle' | 'roundedRect' | 'circle' | 'triangle' | 'star';
type CurveType = 'quad' | 'cubic' | 'arc';

interface ShapesDemoState {
  // Basic shapes
  selectedShape: BasicShapeType;

  // Stroke/Fill
  showStroke: boolean;
  showFill: boolean;
  strokeWidth: number;
  strokeCap: ShapeStrokeCap;
  strokeJoin: ShapeStrokeJoin;

  // Curves
  curveType: CurveType;
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
  arcAngle: number;

  // Path animation
  strokeStart: number;
  strokeEnd: number;
  isAnimating: boolean;
  spinnerRotation: number;
}

@NavigationPage(module)
export class ShapesDemo extends StatefulComponent<ShapesDemoViewModel, ShapesDemoState> {
  private spinnerAnimationFrame?: number;

  state: ShapesDemoState = {
    // Basic shapes
    selectedShape: 'rectangle',

    // Stroke/Fill
    showStroke: true,
    showFill: true,
    strokeWidth: 2,
    strokeCap: 'round',
    strokeJoin: 'round',

    // Curves
    curveType: 'quad',
    controlPoint1: { x: 100, y: 50 },
    controlPoint2: { x: 60, y: 20 },
    arcAngle: Math.PI,

    // Path animation
    strokeStart: 0,
    strokeEnd: 0,
    isAnimating: false,
    spinnerRotation: 0,
  };

  onMount() {
    this.startSpinnerAnimation();
  }

  onUnmount() {
    if (this.spinnerAnimationFrame !== undefined) {
      cancelAnimationFrame(this.spinnerAnimationFrame);
    }
  }

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Shapes & Paths"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Basic Shapes */}
          <DemoSection
            title="Basic Shapes"
            description="Rectangles, circles, triangles, and custom shapes using GeometricPathBuilder"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Shape selector */}
                <layout flexDirection="row" flexWrap="wrap" gap={Spacing.xs}>
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
                <view
                  width="100%"
                  height={200}
                  backgroundColor={Colors.gray100}
                  borderRadius={BorderRadius.base}
                  alignItems="center"
                  justifyContent="center"
                >
                  <shape
                    width={150}
                    height={150}
                    path={this.getShapePath(this.state.selectedShape)}
                    fillColor={Colors.primary}
                    strokeColor={Colors.secondary}
                    strokeWidth={2}
                  />
                </view>

                <label
                  value={this.getShapeDescription(this.state.selectedShape)}
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                  textAlign="center"
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Stroke vs Fill Properties */}
          <DemoSection
            title="Stroke vs Fill"
            description="Control stroke and fill properties independently"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Stroke/Fill toggles */}
                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title={this.state.showStroke ? 'Stroke: ON' : 'Stroke: OFF'}
                    variant={this.state.showStroke ? 'primary' : 'outline'}
                    onTap={() => this.setState({ showStroke: !this.state.showStroke })}
                  />
                  <Button
                    title={this.state.showFill ? 'Fill: ON' : 'Fill: OFF'}
                    variant={this.state.showFill ? 'primary' : 'outline'}
                    onTap={() => this.setState({ showFill: !this.state.showFill })}
                  />
                </layout>

                {/* Shape display */}
                <view
                  width="100%"
                  height={200}
                  backgroundColor={Colors.gray100}
                  borderRadius={BorderRadius.base}
                  alignItems="center"
                  justifyContent="center"
                >
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
                </view>

                {/* Stroke width control */}
                {this.state.showStroke && (
                  <layout width="100%" gap={Spacing.sm}>
                    <label
                      value={`Stroke Width: ${this.state.strokeWidth}px`}
                      font={Fonts.body}
                      color={Colors.textPrimary}
                    />
                    <layout flexDirection="row" flexWrap="wrap" gap={Spacing.xs}>
                      {[1, 2, 4, 8, 12].map((width) => (
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
                    <label value="Stroke Cap" font={Fonts.body} color={Colors.textPrimary} />
                    <layout flexDirection="row" flexWrap="wrap" gap={Spacing.xs}>
                      {(['butt', 'round', 'square'] as ShapeStrokeCap[]).map((cap) => (
                        <Button
                          key={cap}
                          title={cap}
                          variant={this.state.strokeCap === cap ? 'primary' : 'outline'}
                          size="small"
                          onTap={() => this.setState({ strokeCap: cap })}
                        />
                      ))}
                    </layout>

                    {/* Stroke join */}
                    <label value="Stroke Join" font={Fonts.body} color={Colors.textPrimary} />
                    <layout flexDirection="row" flexWrap="wrap" gap={Spacing.xs}>
                      {(['bevel', 'miter', 'round'] as ShapeStrokeJoin[]).map((join) => (
                        <Button
                          key={join}
                          title={join}
                          variant={this.state.strokeJoin === join ? 'primary' : 'outline'}
                          size="small"
                          onTap={() => this.setState({ strokeJoin: join })}
                        />
                      ))}
                    </layout>
                  </layout>
                )}
              </layout>
            </Card>
          </DemoSection>

          {/* Bezier Curves & Arcs */}
          <DemoSection
            title="Bezier Curves & Arcs"
            description="Quadratic curves, cubic curves, and arcs for smooth shapes"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Curve type selector */}
                <layout flexDirection="row" gap={Spacing.sm}>
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
                  width="100%"
                  height={240}
                  backgroundColor={Colors.gray100}
                  borderRadius={BorderRadius.base}
                  alignItems="center"
                  justifyContent="center"
                >
                  <view width={220} height={220} position="relative">
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
                </view>

                {/* Arc angle control */}
                {this.state.curveType === 'arc' && (
                  <layout width="100%" gap={Spacing.sm}>
                    <label
                      value={`Arc Angle: ${this.toDegrees(this.state.arcAngle).toFixed(0)}°`}
                      font={Fonts.body}
                      color={Colors.textPrimary}
                    />
                    <layout flexDirection="row" flexWrap="wrap" gap={Spacing.xs}>
                      {[90, 180, 270, 360].map((degrees) => {
                        const radians = this.toRadians(degrees);
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

                <label
                  value={this.getCurveDescription(this.state.curveType)}
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Path Animation (Stroke Trimming) */}
          <DemoSection
            title="Path Animation"
            description="Animate paths by trimming stroke start and end positions"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <label
                  value="Stroke Trimming Animation"
                  font={Fonts.h3}
                  color={Colors.textPrimary}
                />

                {/* Checkmark animation */}
                <view
                  width="100%"
                  height={150}
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
                <layout flexDirection="row" gap={Spacing.sm}>
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
                <label
                  value={`Start: ${(this.state.strokeStart * 100).toFixed(0)}% | End: ${(this.state.strokeEnd * 100).toFixed(0)}%`}
                  font={Fonts.body}
                  color={Colors.textPrimary}
                />

                {/* Loading spinner example */}
                <label
                  value="Animated Loader"
                  font={Fonts.h3}
                  color={Colors.textPrimary}
                  marginTop={Spacing.base}
                />
                <view
                  width="100%"
                  height={120}
                  backgroundColor={Colors.gray100}
                  borderRadius={BorderRadius.base}
                  alignItems="center"
                  justifyContent="center"
                >
                  <view width={80} height={80} rotation={this.state.spinnerRotation}>
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
                </view>
              </layout>
            </Card>
          </DemoSection>

          {/* Complex Shapes */}
          <DemoSection
            title="Complex Shapes"
            description="Custom shapes using advanced path commands"
          >
            <Card>
              <layout width="100%" gap={Spacing.lg}>
                {/* Heart shape */}
                <layout width="100%" gap={Spacing.sm}>
                  <label value="Heart Shape" font={Fonts.h3} color={Colors.textPrimary} />
                  <view
                    width="100%"
                    height={120}
                    backgroundColor={Colors.gray100}
                    borderRadius={BorderRadius.base}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <shape
                      width={100}
                      height={100}
                      path={this.createHeartPath()}
                      fillColor={Colors.error}
                    />
                  </view>
                  <label
                    value="Created with cubic bezier curves"
                    font={Fonts.caption}
                    color={Colors.textSecondary}
                  />
                </layout>

                {/* Wave */}
                <layout width="100%" gap={Spacing.sm}>
                  <label value="Wave (Sine Curve)" font={Fonts.h3} color={Colors.textPrimary} />
                  <view
                    width="100%"
                    height={120}
                    backgroundColor={Colors.gray100}
                    borderRadius={BorderRadius.base}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <shape
                      width={220}
                      height={100}
                      path={this.createWavePath()}
                      strokeColor={Colors.primary}
                      strokeWidth={3}
                      strokeCap="round"
                      strokeJoin="round"
                    />
                  </view>
                  <label
                    value="Generated with math functions"
                    font={Fonts.caption}
                    color={Colors.textSecondary}
                  />
                </layout>

                {/* Arrow */}
                <layout width="100%" gap={Spacing.sm}>
                  <label value="Arrow Shape" font={Fonts.h3} color={Colors.textPrimary} />
                  <view
                    width="100%"
                    height={120}
                    backgroundColor={Colors.gray100}
                    borderRadius={BorderRadius.base}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <shape
                      width={150}
                      height={80}
                      path={this.createArrowPath()}
                      fillColor={Colors.secondary}
                    />
                  </view>
                  <label
                    value="Custom path with precise coordinates"
                    font={Fonts.caption}
                    color={Colors.textSecondary}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Create a custom shape path
const builder = new GeometricPathBuilder(100, 100, 'contain');
const path = builder
  .moveTo(50, 10)      // Top point
  .lineTo(90, 90)      // Bottom right
  .lineTo(10, 90)      // Bottom left
  .close()             // Close path
  .build();

// Render with stroke and fill
<shape
  width={150}
  height={150}
  path={path}
  fillColor="#3B82F6"
  strokeColor="#1E40AF"
  strokeWidth={2}
  strokeCap="round"
  strokeJoin="round"
/>

// Animate path drawing
<shape
  path={path}
  strokeColor="#10B981"
  strokeWidth={8}
  strokeCap="round"
  strokeStart={0}
  strokeEnd={this.state.progress}  // 0 to 1
/>`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // ============================================================================
  // Basic Shapes
  // ============================================================================

  private getShapePath(shapeType: BasicShapeType): GeometricPath {
    switch (shapeType) {
      case 'rectangle':
        return this.createRectanglePath();
      case 'roundedRect':
        return this.createRoundedRectPath();
      case 'circle':
        return this.createCirclePath();
      case 'triangle':
        return this.createTrianglePath();
      case 'star':
        return this.createStarPath();
    }
  }

  private createRectanglePath(): GeometricPath {
    const builder = new GeometricPathBuilder(100, 100, 'contain');
    return builder.rectTo(10, 10, 80, 80).build();
  }

  private createRoundedRectPath(): GeometricPath {
    const builder = new GeometricPathBuilder(100, 100, 'contain');
    return builder.roundRectTo(10, 10, 80, 80, 20, 20).build();
  }

  private createCirclePath(): GeometricPath {
    const builder = new GeometricPathBuilder(100, 100, 'contain');
    return builder.ovalTo(10, 10, 80, 80).build();
  }

  private createTrianglePath(): GeometricPath {
    const builder = new GeometricPathBuilder(100, 100, 'contain');
    return builder
      .moveTo(50, 10) // Top point
      .lineTo(90, 90) // Bottom right
      .lineTo(10, 90) // Bottom left
      .close() // Close path back to start
      .build();
  }

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

  private getShapeDescription(shapeType: BasicShapeType): string {
    switch (shapeType) {
      case 'rectangle':
        return 'Built with rectTo() method';
      case 'roundedRect':
        return 'Built with roundRectTo() with radius';
      case 'circle':
        return 'Built with ovalTo() method';
      case 'triangle':
        return 'Built with moveTo(), lineTo(), and close()';
      case 'star':
        return 'Custom path with calculated coordinates';
    }
  }

  // ============================================================================
  // Stroke/Fill Demo
  // ============================================================================

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

  // ============================================================================
  // Curves
  // ============================================================================

  private getCurvePath(curveType: CurveType): GeometricPath {
    switch (curveType) {
      case 'quad':
        return this.createQuadraticCurve();
      case 'cubic':
        return this.createCubicCurve();
      case 'arc':
        return this.createArcPath();
    }
  }

  private createQuadraticCurve(): GeometricPath {
    const builder = new GeometricPathBuilder(200, 200, 'contain');
    const cp = this.state.controlPoint1;

    return builder.moveTo(20, 180).quadTo(cp.x, cp.y, 180, 180).build();
  }

  private createCubicCurve(): GeometricPath {
    const builder = new GeometricPathBuilder(200, 200, 'contain');
    const cp1 = this.state.controlPoint1;
    const cp2 = this.state.controlPoint2;

    return builder.moveTo(20, 180).cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, 180, 180).build();
  }

  private createArcPath(): GeometricPath {
    const builder = new GeometricPathBuilder(200, 200, 'contain');

    return builder.moveTo(100, 20).arcTo(100, 100, 80, -Math.PI / 2, this.state.arcAngle).build();
  }

  private getCurveDescription(curveType: CurveType): string {
    switch (curveType) {
      case 'quad':
        return 'Quadratic bezier with one control point (red)';
      case 'cubic':
        return 'Cubic bezier with two control points (red & yellow)';
      case 'arc':
        return 'Arc segment from a circle';
    }
  }

  // ============================================================================
  // Path Animation
  // ============================================================================

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
    return builder.moveTo(20, 50).lineTo(40, 70).lineTo(80, 30).build();
  }

  private createCircleLoaderPath(): GeometricPath {
    const builder = new GeometricPathBuilder(100, 100, 'contain');
    return builder.arcTo(50, 50, 40, 0, Math.PI * 2).build();
  }

  private startSpinnerAnimation() {
    const animate = () => {
      this.setState({
        spinnerRotation: (this.state.spinnerRotation + 0.1) % (Math.PI * 2),
      });

      this.spinnerAnimationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  // ============================================================================
  // Complex Shapes
  // ============================================================================

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

  private createArrowPath(): GeometricPath {
    const builder = new GeometricPathBuilder(150, 80, 'contain');

    return builder
      .moveTo(10, 30) // Start of shaft
      .lineTo(90, 30) // Shaft top
      .lineTo(90, 10) // Arrow head start
      .lineTo(140, 40) // Arrow head tip
      .lineTo(90, 70) // Arrow head bottom
      .lineTo(90, 50) // Back to shaft
      .lineTo(10, 50) // Shaft bottom
      .close()
      .build();
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
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

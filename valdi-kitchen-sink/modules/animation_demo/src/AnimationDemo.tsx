/**
 * AnimationDemo Component
 * Demonstrates animate() method with various animation curves and properties
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';

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

export interface AnimationDemoViewModel {
  navigationController: NavigationController;
}

interface AnimationDemoState {
  // Color animation
  boxColor: string;

  // Size animation
  boxScale: number;

  // Position animation
  boxPosition: number;

  // Opacity animation
  boxOpacity: number;

  // Rotation animation
  boxRotation: number;

  // Combined animation
  combinedScale: number;
  combinedOpacity: number;
}

@NavigationPage(module)
export class AnimationDemo extends StatefulComponent<AnimationDemoViewModel, AnimationDemoState> {
  state: AnimationDemoState = {
    boxColor: Colors.primary,
    boxScale: 1,
    boxPosition: 0,
    boxOpacity: 1,
    boxRotation: 0,
    combinedScale: 1,
    combinedOpacity: 1,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Animations"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Color Animation */}
          <DemoSection
            title="Color Animation"
            description="Animate backgroundColor with smooth transitions"
          >
            <Card>
              <layout width="100%" gap={Spacing.md} alignItems="center">
                <view
                  width={100}
                  height={100}
                  backgroundColor={this.state.boxColor}
                  borderRadius={BorderRadius.base}
                />

                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title="Blue"
                    variant="primary"
                    size="small"
                    onTap={() => this.animateColor(Colors.primary)}
                  />
                  <Button
                    title="Purple"
                    variant="secondary"
                    size="small"
                    onTap={() => this.animateColor(Colors.secondary)}
                  />
                  <Button
                    title="Green"
                    variant="outline"
                    size="small"
                    onTap={() => this.animateColor(Colors.success)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Scale Animation */}
          <DemoSection
            title="Scale Animation"
            description="Animate size using scaleX and scaleY properties"
          >
            <Card>
              <layout width="100%" gap={Spacing.md} alignItems="center">
                <view
                  width={100}
                  height={100}
                  backgroundColor={Colors.secondary}
                  borderRadius={BorderRadius.base}
                  scaleX={this.state.boxScale}
                  scaleY={this.state.boxScale}
                />

                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title="Small"
                    variant="outline"
                    size="small"
                    onTap={() => this.animateScale(0.5)}
                  />
                  <Button
                    title="Normal"
                    variant="primary"
                    size="small"
                    onTap={() => this.animateScale(1)}
                  />
                  <Button
                    title="Large"
                    variant="secondary"
                    size="small"
                    onTap={() => this.animateScale(1.5)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Position Animation */}
          <DemoSection
            title="Position Animation"
            description="Animate position using translationX and translationY"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <view
                  width="100%"
                  height={120}
                  backgroundColor={Colors.gray100}
                  borderRadius={BorderRadius.base}
                  alignItems="center"
                  justifyContent="center"
                >
                  <view
                    width={60}
                    height={60}
                    backgroundColor={Colors.success}
                    borderRadius={BorderRadius.full}
                    translationX={this.state.boxPosition}
                  />
                </view>

                <layout flexDirection="row" gap={Spacing.sm} justifyContent="center">
                  <Button
                    title="← Left"
                    variant="outline"
                    size="small"
                    onTap={() => this.animatePosition(-80)}
                  />
                  <Button
                    title="Center"
                    variant="primary"
                    size="small"
                    onTap={() => this.animatePosition(0)}
                  />
                  <Button
                    title="Right →"
                    variant="outline"
                    size="small"
                    onTap={() => this.animatePosition(80)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Opacity Animation */}
          <DemoSection
            title="Opacity Animation"
            description="Fade in and out using opacity property"
          >
            <Card>
              <layout width="100%" gap={Spacing.md} alignItems="center">
                <view
                  width={100}
                  height={100}
                  backgroundColor={Colors.warning}
                  borderRadius={BorderRadius.base}
                  opacity={this.state.boxOpacity}
                />

                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title="Hide"
                    variant="outline"
                    size="small"
                    onTap={() => this.animateOpacity(0)}
                  />
                  <Button
                    title="50%"
                    variant="outline"
                    size="small"
                    onTap={() => this.animateOpacity(0.5)}
                  />
                  <Button
                    title="Show"
                    variant="primary"
                    size="small"
                    onTap={() => this.animateOpacity(1)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Rotation Animation */}
          <DemoSection
            title="Rotation Animation"
            description="Rotate elements using rotation property (in radians)"
          >
            <Card>
              <layout width="100%" gap={Spacing.md} alignItems="center">
                <view
                  width={100}
                  height={100}
                  backgroundColor={Colors.error}
                  borderRadius={BorderRadius.base}
                  rotation={this.state.boxRotation}
                >
                  <layout width="100%" height="100%" alignItems="center" justifyContent="center">
                    <label font={Fonts.h2} color={Colors.white} value="↑" />
                  </layout>
                </view>

                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title="90°"
                    variant="outline"
                    size="small"
                    onTap={() => this.animateRotation(Math.PI / 2)}
                  />
                  <Button
                    title="180°"
                    variant="outline"
                    size="small"
                    onTap={() => this.animateRotation(Math.PI)}
                  />
                  <Button
                    title="360°"
                    variant="primary"
                    size="small"
                    onTap={() => this.animateRotation(Math.PI * 2)}
                  />
                  <Button
                    title="Reset"
                    variant="secondary"
                    size="small"
                    onTap={() => this.animateRotation(0)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Combined Animation */}
          <DemoSection
            title="Combined Animations"
            description="Animate multiple properties simultaneously"
          >
            <Card>
              <layout width="100%" gap={Spacing.md} alignItems="center">
                <view
                  width={100}
                  height={100}
                  backgroundColor={Colors.primary}
                  borderRadius={BorderRadius.base}
                  scaleX={this.state.combinedScale}
                  scaleY={this.state.combinedScale}
                  opacity={this.state.combinedOpacity}
                />

                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title="Pulse"
                    variant="primary"
                    onTap={() => this.animatePulse()}
                  />
                  <Button
                    title="Reset"
                    variant="outline"
                    onTap={() => this.resetCombined()}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Animate background color
this.animate(
  { duration: 0.3, curve: 'easeInOut' },
  () => {
    this.setState({ boxColor: '#3B82F6' });
  }
);

// Animate multiple properties
this.animate(
  { duration: 0.5, curve: 'easeInOut' },
  () => {
    this.setState({
      scale: 1.5,
      opacity: 0.5,
      rotation: Math.PI,
    });
  }
);`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // Animation methods
  private animateColor(color: string) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ boxColor: color });
    });
  }

  private animateScale(scale: number) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ boxScale: scale });
    });
  }

  private animatePosition(position: number) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ boxPosition: position });
    });
  }

  private animateOpacity(opacity: number) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ boxOpacity: opacity });
    });
  }

  private animateRotation(rotation: number) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ boxRotation: rotation });
    });
  }

  private animatePulse() {
    // Animate to larger size with fade
    this.animate({ duration: 0.3, curve: 'easeOut' }, () => {
      this.setState({ combinedScale: 1.3, combinedOpacity: 0.7 });
    });

    // After 300ms, animate back
    setTimeout(() => {
      this.animate({ duration: 0.3, curve: 'easeIn' }, () => {
        this.setState({ combinedScale: 1, combinedOpacity: 1 });
      });
    }, 300);
  }

  private resetCombined() {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ combinedScale: 1, combinedOpacity: 1 });
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

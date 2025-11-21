/**
 * StylingDemo Component
 * Demonstrates advanced styling capabilities: gradients, shadows, blur, opacity, and combined effects
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

export interface StylingDemoViewModel {
  navigationController: NavigationController;
}

type GradientType = 'sunset' | 'ocean' | 'forest' | 'purpleBlue';
type ElevationLevel = 'none' | 'light' | 'medium' | 'heavy';
type BlurStyle = 'light' | 'dark' | 'regular' | 'prominent';

interface StylingDemoState {
  // Gradients
  gradientType: GradientType;

  // Shadows
  elevationLevel: ElevationLevel;
  isPressed: boolean;

  // Blur
  selectedBlurStyle: BlurStyle;
  showBlur: boolean;

  // Opacity
  opacity: number;
  fadeVisible: boolean;
}

@NavigationPage(module)
export class StylingDemo extends StatefulComponent<StylingDemoViewModel, StylingDemoState> {
  state: StylingDemoState = {
    gradientType: 'sunset',
    elevationLevel: 'medium',
    isPressed: false,
    selectedBlurStyle: 'light',
    showBlur: true,
    opacity: 1,
    fadeVisible: true,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Advanced Styling"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Linear Gradients */}
          <DemoSection
            title="Linear Gradients"
            description="Create beautiful color gradients with even or custom stops"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Even-stop gradient */}
                <label
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  value="Even-Stop Gradient (3 colors)"
                />
                <view
                  width="100%"
                  height={120}
                  background="linear-gradient(#FF6B6B, #FFD93D, #6BCF7F)"
                  borderRadius={BorderRadius.base}
                >
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label
                      value="Sunset Gradient"
                      font={Fonts.h3}
                      color={Colors.white}
                    />
                  </layout>
                </view>

                {/* Custom-stop gradient */}
                <label
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  value="Custom-Stop Gradient (with percentages)"
                />
                <view
                  width="100%"
                  height={120}
                  background="linear-gradient(#667EEA 0%, #764BA2 50%, #F093FB 100%)"
                  borderRadius={BorderRadius.base}
                >
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label
                      value="Custom Stops"
                      font={Fonts.h3}
                      color={Colors.white}
                    />
                  </layout>
                </view>

                {/* Gradient selector */}
                <label
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  value="Try Different Gradients:"
                />
                <layout flexDirection="row" flexWrap="wrap" gap={Spacing.sm}>
                  <Button
                    title="Sunset"
                    variant={this.state.gradientType === 'sunset' ? 'primary' : 'outline'}
                    size="small"
                    onTap={() => this.setState({ gradientType: 'sunset' })}
                  />
                  <Button
                    title="Ocean"
                    variant={this.state.gradientType === 'ocean' ? 'primary' : 'outline'}
                    size="small"
                    onTap={() => this.setState({ gradientType: 'ocean' })}
                  />
                  <Button
                    title="Forest"
                    variant={this.state.gradientType === 'forest' ? 'primary' : 'outline'}
                    size="small"
                    onTap={() => this.setState({ gradientType: 'forest' })}
                  />
                  <Button
                    title="Purple-Blue"
                    variant={this.state.gradientType === 'purpleBlue' ? 'primary' : 'outline'}
                    size="small"
                    onTap={() => this.setState({ gradientType: 'purpleBlue' })}
                  />
                </layout>

                {/* Selected gradient preview */}
                <view
                  width="100%"
                  height={100}
                  background={this.getGradient(this.state.gradientType)}
                  borderRadius={BorderRadius.base}
                >
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label
                      value={this.state.gradientType.toUpperCase()}
                      font={Fonts.h2}
                      color={Colors.white}
                    />
                  </layout>
                </view>
              </layout>
            </Card>
          </DemoSection>

          {/* Box Shadows & Elevation */}
          <DemoSection
            title="Box Shadows & Elevation"
            description="Add depth with shadows using Material Design elevation levels"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Elevation examples */}
                <label
                  value="Elevation Levels (1-5)"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <layout flexDirection="row" flexWrap="wrap" justifyContent="space-around" gap={Spacing.md}>
                  {[1, 2, 3, 4, 5].map(elevation => (
                    <view
                      key={elevation}
                      width={70}
                      height={70}
                      backgroundColor={Colors.white}
                      borderRadius={BorderRadius.base}
                      boxShadow={this.getShadowForElevation(elevation)}
                    >
                      <layout
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <label value={`${elevation}`} font={Fonts.h2} color={Colors.textPrimary} />
                      </layout>
                    </view>
                  ))}
                </layout>

                {/* Colored shadows (glows) */}
                <label
                  value="Colored Shadows (Glows)"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  marginTop={Spacing.sm}
                />

                <layout flexDirection="row" justifyContent="space-around" gap={Spacing.md}>
                  <view
                    width={90}
                    height={90}
                    backgroundColor={Colors.primary}
                    borderRadius={BorderRadius.base}
                    boxShadow="0 8 24 rgba(59, 130, 246, 0.5)"
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="Blue" font={Fonts.body} color={Colors.white} />
                    </layout>
                  </view>
                  <view
                    width={90}
                    height={90}
                    backgroundColor={Colors.secondary}
                    borderRadius={BorderRadius.base}
                    boxShadow="0 8 24 rgba(139, 92, 246, 0.5)"
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="Purple" font={Fonts.body} color={Colors.white} />
                    </layout>
                  </view>
                  <view
                    width={90}
                    height={90}
                    backgroundColor={Colors.success}
                    borderRadius={BorderRadius.base}
                    boxShadow="0 8 24 rgba(34, 197, 94, 0.5)"
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="Green" font={Fonts.body} color={Colors.white} />
                    </layout>
                  </view>
                </layout>

                {/* Interactive shadow demo */}
                <label
                  value="Interactive Shadow (Press Me)"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  marginTop={Spacing.sm}
                />

                <layout width="100%" alignItems="center">
                  <view
                    width={150}
                    height={150}
                    backgroundColor={Colors.white}
                    borderRadius={BorderRadius.base}
                    boxShadow={this.state.isPressed
                      ? '0 2 4 rgba(0, 0, 0, 0.1)'
                      : '0 8 24 rgba(0, 0, 0, 0.2)'
                    }
                    scaleX={this.state.isPressed ? 0.95 : 1}
                    scaleY={this.state.isPressed ? 0.95 : 1}
                    onTouchStart={() => this.setState({ isPressed: true })}
                    onTouchEnd={() => this.setState({ isPressed: false })}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label
                        value={this.state.isPressed ? 'Pressed!' : 'Press Me'}
                        font={Fonts.h3}
                        color={Colors.textPrimary}
                      />
                    </layout>
                  </view>
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Opacity & Fading */}
          <DemoSection
            title="Opacity & Fading"
            description="Control transparency and create smooth fade animations"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Opacity control */}
                <label
                  value={`Current Opacity: ${(this.state.opacity * 100).toFixed(0)}%`}
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <layout width="100%" alignItems="center">
                  <view
                    width={200}
                    height={200}
                    backgroundColor={Colors.primary}
                    borderRadius={BorderRadius.base}
                    opacity={this.state.opacity}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label
                        value={`${(this.state.opacity * 100).toFixed(0)}%`}
                        font={Fonts.h1}
                        color={Colors.white}
                      />
                    </layout>
                  </view>
                </layout>

                {/* Opacity presets */}
                <layout flexDirection="row" flexWrap="wrap" gap={Spacing.sm} justifyContent="center">
                  {[0, 0.25, 0.5, 0.75, 1].map(op => (
                    <Button
                      key={op}
                      title={`${(op * 100).toFixed(0)}%`}
                      variant={this.state.opacity === op ? 'primary' : 'outline'}
                      size="small"
                      onTap={() => this.animateOpacity(op)}
                    />
                  ))}
                </layout>

                {/* Fade animation demo */}
                <label
                  value="Fade Animation"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  marginTop={Spacing.sm}
                />

                <layout width="100%" alignItems="center">
                  <view
                    width={200}
                    height={100}
                    backgroundColor={Colors.secondary}
                    borderRadius={BorderRadius.base}
                    opacity={this.state.fadeVisible ? 1 : 0}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label
                        value="I fade in/out"
                        font={Fonts.h3}
                        color={Colors.white}
                      />
                    </layout>
                  </view>
                </layout>

                <layout flexDirection="row" gap={Spacing.sm} justifyContent="center">
                  <Button
                    title="Fade In"
                    variant="primary"
                    onTap={() => this.animateFade(true)}
                  />
                  <Button
                    title="Fade Out"
                    variant="outline"
                    onTap={() => this.animateFade(false)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Border Styles */}
          <DemoSection
            title="Border Styles"
            description="Various border widths, colors, and radius options"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Border widths */}
                <label
                  value="Border Widths"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <layout flexDirection="row" flexWrap="wrap" gap={Spacing.md} justifyContent="space-around">
                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.white}
                    borderWidth={1}
                    borderColor={Colors.primary}
                    borderRadius={BorderRadius.sm}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="1px" font={Fonts.body} color={Colors.textPrimary} />
                    </layout>
                  </view>

                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.white}
                    borderWidth={2}
                    borderColor={Colors.secondary}
                    borderRadius={BorderRadius.sm}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="2px" font={Fonts.body} color={Colors.textPrimary} />
                    </layout>
                  </view>

                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.white}
                    borderWidth={4}
                    borderColor={Colors.success}
                    borderRadius={BorderRadius.sm}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="4px" font={Fonts.body} color={Colors.textPrimary} />
                    </layout>
                  </view>
                </layout>

                {/* Border radius */}
                <label
                  value="Border Radius"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                  marginTop={Spacing.sm}
                />

                <layout flexDirection="row" flexWrap="wrap" gap={Spacing.md} justifyContent="space-around">
                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.primary}
                    borderRadius={0}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="None" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>

                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.secondary}
                    borderRadius={BorderRadius.sm}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="Small" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>

                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.success}
                    borderRadius={BorderRadius.base}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="Base" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>

                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.warning}
                    borderRadius={BorderRadius.full}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="Full" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* 2D Transforms */}
          <DemoSection
            title="2D Transforms"
            description="Scale, rotate, and translate elements"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Scale */}
                <label
                  value="Scale Transform"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <layout width="100%" alignItems="center" height={120} justifyContent="center">
                  <view
                    width={80}
                    height={80}
                    backgroundColor={Colors.primary}
                    borderRadius={BorderRadius.base}
                    scaleX={1.5}
                    scaleY={1.5}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="1.5x" font={Fonts.h3} color={Colors.white} />
                    </layout>
                  </view>
                </layout>

                {/* Rotation */}
                <label
                  value="Rotation Transform"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <layout flexDirection="row" gap={Spacing.md} justifyContent="space-around">
                  <view
                    width={60}
                    height={60}
                    backgroundColor={Colors.secondary}
                    borderRadius={BorderRadius.sm}
                    rotation={Math.PI / 4}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="45°" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>

                  <view
                    width={60}
                    height={60}
                    backgroundColor={Colors.success}
                    borderRadius={BorderRadius.sm}
                    rotation={Math.PI / 2}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="90°" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>

                  <view
                    width={60}
                    height={60}
                    backgroundColor={Colors.warning}
                    borderRadius={BorderRadius.sm}
                    rotation={Math.PI}
                  >
                    <layout
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <label value="180°" font={Fonts.caption} color={Colors.white} />
                    </layout>
                  </view>
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Combined Effects */}
          <DemoSection
            title="Combined Effects"
            description="Real-world examples combining multiple styling features"
          >
            <Card>
              <layout width="100%" gap={Spacing.lg}>
                {/* Premium pricing card example */}
                <label
                  value="Premium Card Example"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <view
                  width="100%"
                  background="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
                  borderRadius={BorderRadius.base}
                  boxShadow="0 10 30 rgba(102, 126, 234, 0.4)"
                  padding={Spacing.lg}
                >
                  <layout gap={Spacing.sm}>
                    <label value="Premium" font={Fonts.h1} color={Colors.white} />
                    <label value="$29/month" font={Fonts.h2} color="rgba(255, 255, 255, 0.9)" />
                    <label
                      value="All features included"
                      font={Fonts.body}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </layout>
                </view>

                {/* Feature card with shadow */}
                <label
                  value="Feature Card"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <view
                  width="100%"
                  backgroundColor={Colors.white}
                  borderRadius={BorderRadius.base}
                  boxShadow="0 4 12 rgba(0, 0, 0, 0.1)"
                  padding={Spacing.base}
                  borderWidth={1}
                  borderColor={Colors.border}
                >
                  <layout gap={Spacing.sm}>
                    <view
                      width={48}
                      height={48}
                      background="linear-gradient(#10B981, #059669)"
                      borderRadius={BorderRadius.base}
                      boxShadow="0 4 8 rgba(16, 185, 129, 0.3)"
                    >
                      <layout
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <label value="✓" font={Fonts.h2} color={Colors.white} />
                      </layout>
                    </view>
                    <label value="Advanced Features" font={Fonts.h3} color={Colors.textPrimary} />
                    <label
                      value="Combine gradients, shadows, and borders for beautiful UI elements"
                      font={Fonts.body}
                      color={Colors.textSecondary}
                      numberOfLines={2}
                    />
                  </layout>
                </view>

                {/* Neumorphism card */}
                <label
                  value="Neumorphism Style"
                  font={Fonts.labelSmall}
                  color={Colors.textSecondary}
                />

                <view
                  width="100%"
                  height={150}
                  backgroundColor="#E0E5EC"
                  borderRadius={BorderRadius.lg}
                  boxShadow="10 10 20 rgba(163, 177, 198, 0.6)"
                  padding={Spacing.base}
                >
                  <layout
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <label
                      value="Soft 3D Effect"
                      font={Fonts.h2}
                      color="#A3B1C6"
                    />
                    <label
                      value="Using dual shadows"
                      font={Fonts.body}
                      color="#A3B1C6"
                    />
                  </layout>
                </view>
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Linear gradient
<view
  background="linear-gradient(#FF6B6B, #FFD93D)"
  borderRadius={8}
/>

// Box shadow with elevation
<view
  backgroundColor="#fff"
  boxShadow="0 4 12 rgba(0, 0, 0, 0.2)"
  borderRadius={8}
/>

// Colored glow effect
<view
  backgroundColor="#3B82F6"
  boxShadow="0 8 24 rgba(59, 130, 246, 0.5)"
/>

// Opacity and transforms
<view
  opacity={0.5}
  scaleX={1.5}
  scaleY={1.5}
  rotation={Math.PI / 4}
/>

// Combined effects
<view
  background="linear-gradient(#667EEA, #764BA2)"
  boxShadow="0 10 30 rgba(102, 126, 234, 0.4)"
  borderRadius={12}
  padding={16}
/>`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // Helper methods
  private getGradient(type: GradientType): string {
    const gradients = {
      sunset: 'linear-gradient(#FF6B6B, #FFD93D, #6BCF7F)',
      ocean: 'linear-gradient(#667EEA 0%, #764BA2 100%)',
      forest: 'linear-gradient(#134E5E, #71B280)',
      purpleBlue: 'linear-gradient(#667EEA, #764BA2, #F093FB)',
    };

    return gradients[type] || gradients.sunset;
  }

  private getShadowForElevation(elevation: number): string {
    // Material Design-inspired elevation shadows
    const shadows = [
      '0 1 3 rgba(0, 0, 0, 0.12)',    // Elevation 1
      '0 2 6 rgba(0, 0, 0, 0.16)',    // Elevation 2
      '0 4 12 rgba(0, 0, 0, 0.2)',    // Elevation 3
      '0 8 24 rgba(0, 0, 0, 0.24)',   // Elevation 4
      '0 16 48 rgba(0, 0, 0, 0.28)',  // Elevation 5
    ];

    return shadows[elevation - 1] || shadows[0];
  }

  private animateOpacity(opacity: number) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ opacity });
    });
  }

  private animateFade(show: boolean) {
    this.animate({ duration: AnimationDurations.normal, curve: 'easeInOut' }, () => {
      this.setState({ fadeVisible: show });
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

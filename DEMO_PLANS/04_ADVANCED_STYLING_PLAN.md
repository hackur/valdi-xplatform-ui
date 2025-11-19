# Advanced Styling Demo - Implementation Plan

## Overview
Demonstrate Valdi's advanced visual styling capabilities including linear gradients, box shadows, blur effects, opacity, and transform-based animations. Show how to create modern, visually appealing UIs with depth and dimension.

## Valdi Capabilities Identified

### Gradient Backgrounds
```typescript
interface View {
  // Sets the background of the view
  // Use "color1" to set a color
  // Use "linear-gradient(color1, color2, color3...)" for evenly-spaced stops
  // Use "linear-gradient(color1 stop1, color2 stop2...)" for custom stops
  background?: string;

  // Alternative: solid color only
  backgroundColor?: Color;
}

// Examples:
background: "linear-gradient(#FF0000, #00FF00, #0000FF)"  // Even stops
background: "linear-gradient(#FF0000 0%, #00FF00 50%, #0000FF 100%)"  // Custom stops
```

### Box Shadows
```typescript
interface View {
  // Add a shadow to the view
  // Syntax: '{xOffset} {yOffset} {shadowOverflow} {color}'
  // All number values are points
  boxShadow?: string;
}

// Examples:
boxShadow: "0 2 10 rgba(0, 0, 0, 0.1)"  // Standard drop shadow
boxShadow: "0 -2 0 rgba(0, 0, 0, 0.15)"  // Top shadow
boxShadow: "0 10 30 rgba(59, 130, 246, 0.5)"  // Colored glow
```

### Blur Effects
```typescript
interface BlurView {
  blurStyle?: BlurStyle;
}

type BlurStyle =
  // Basic styles
  | 'extraLight'
  | 'light'
  | 'dark'
  | 'regular'
  | 'prominent'
  // System materials (iOS)
  | 'systemUltraThinMaterial'
  | 'systemThinMaterial'
  | 'systemMaterial'
  | 'systemThickMaterial'
  | 'systemChromeMaterial'
  // Light variants
  | 'systemUltraThinMaterialLight'
  | 'systemThinMaterialLight'
  | 'systemMaterialLight'
  | 'systemThickMaterialLight'
  | 'systemChromeMaterialLight'
  // Dark variants
  | 'systemUltraThinMaterialDark'
  | 'systemThinMaterialDark'
  | 'systemMaterialDark'
  | 'systemThickMaterialDark'
  | 'systemChromeMaterialDark';

// Note: BlurView may be iOS-only
```

### Opacity & Transform
```typescript
interface View {
  opacity?: number;  // 0-1

  // Transform properties (GPU-accelerated)
  scaleX?: number;
  scaleY?: number;
  rotation?: number;  // Radians
  translationX?: number;
  translationY?: number;
}
```

## Implementation Sections

### 1. Linear Gradients (1.5 hours)

**Features to demonstrate:**
- Basic two-color gradient
- Multi-color gradients (3+ colors)
- Custom gradient stops
- Gradient direction (vertical by default)
- Animated gradient transitions
- Gradient as button/card backgrounds

**Example structure:**
```typescript
interface GradientState {
  gradientType: 'sunset' | 'ocean' | 'forest' | 'custom';
  customColors: string[];
}

private getGradient(type: string): string {
  const gradients = {
    sunset: "linear-gradient(#FF6B6B, #FFD93D, #6BCF7F)",
    ocean: "linear-gradient(#667EEA 0%, #764BA2 100%)",
    forest: "linear-gradient(#134E5E, #71B280)",
    purpleBlue: "linear-gradient(#667EEA, #764BA2, #F093FB)",
  };

  return gradients[type] || gradients.sunset;
}

<DemoSection title="Linear Gradients">
  <Card>
    <layout>
      {/* Even-stop gradient */}
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
            value="Even-Stop Gradient"
            font={Fonts.h3}
            color={Colors.white}
          />
        </layout>
      </view>

      {/* Custom-stop gradient */}
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
            value="Custom-Stop Gradient"
            font={Fonts.h3}
            color={Colors.white}
          />
        </layout>
      </view>

      {/* Gradient selector buttons */}
      <layout flexDirection="row" flexWrap="wrap">
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
      </layout>

      {/* Selected gradient preview */}
      <view
        width="100%"
        height={80}
        background={this.getGradient(this.state.gradientType)}
        borderRadius={BorderRadius.base}
      />
    </layout>
  </Card>
</DemoSection>
```

### 2. Box Shadows & Depth (2 hours)

**Features:**
- Basic drop shadow
- Elevation levels (light, medium, heavy)
- Colored shadows (glows)
- Shadow direction (top, bottom, sides)
- Animated shadow changes
- Card with shadow on hover simulation

**State management:**
```typescript
interface ShadowState {
  elevationLevel: 'none' | 'light' | 'medium' | 'heavy';
  shadowColor: string;
  isPressed: boolean;
}

private getShadow(level: string, color: string = 'rgba(0, 0, 0, 0.2)'): string {
  const shadows = {
    none: "0 0 0 rgba(0, 0, 0, 0)",
    light: `0 2 8 ${color}`,
    medium: `0 4 16 ${color}`,
    heavy: `0 8 32 ${color}`,
  };

  return shadows[level] || shadows.none;
}

private getShadowForElevation(elevation: number): string {
  // iOS-style elevation shadows
  const shadows = [
    "0 1 3 rgba(0, 0, 0, 0.12)",    // Elevation 1
    "0 2 6 rgba(0, 0, 0, 0.16)",    // Elevation 2
    "0 4 12 rgba(0, 0, 0, 0.2)",    // Elevation 3
    "0 8 24 rgba(0, 0, 0, 0.24)",   // Elevation 4
    "0 16 48 rgba(0, 0, 0, 0.28)",  // Elevation 5
  ];

  return shadows[elevation - 1] || shadows[0];
}
```

**UI structure:**
```typescript
<DemoSection title="Box Shadows & Elevation">
  <Card>
    <layout>
      {/* Elevation examples */}
      <label
        value="Elevation Levels"
        font={Fonts.h3}
        color={Colors.text}
      />

      <layout flexDirection="row" flexWrap="wrap" justifyContent="space-around">
        {[1, 2, 3, 4, 5].map(elevation => (
          <view
            key={elevation}
            width={80}
            height={80}
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
              <label value={`${elevation}`} font={Fonts.h2} color={Colors.text} />
            </layout>
          </view>
        ))}
      </layout>

      {/* Colored shadows (glows) */}
      <label
        value="Colored Shadows"
        font={Fonts.h3}
        color={Colors.text}
      />

      <layout flexDirection="row" justifyContent="space-around">
        <view
          width={100}
          height={100}
          backgroundColor={Colors.primary}
          borderRadius={BorderRadius.base}
          boxShadow="0 8 24 rgba(59, 130, 246, 0.5)"
        />
        <view
          width={100}
          height={100}
          backgroundColor={Colors.secondary}
          borderRadius={BorderRadius.base}
          boxShadow="0 8 24 rgba(139, 92, 246, 0.5)"
        />
        <view
          width={100}
          height={100}
          backgroundColor={Colors.success}
          borderRadius={BorderRadius.base}
          boxShadow="0 8 24 rgba(34, 197, 94, 0.5)"
        />
      </layout>

      {/* Interactive shadow demo */}
      <label
        value="Press to Change Shadow"
        font={Fonts.h3}
        color={Colors.text}
      />

      <view
        width={150}
        height={150}
        backgroundColor={Colors.white}
        borderRadius={BorderRadius.base}
        boxShadow={this.state.isPressed
          ? "0 2 4 rgba(0, 0, 0, 0.1)"
          : "0 8 24 rgba(0, 0, 0, 0.2)"
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
            value={this.state.isPressed ? "Pressed" : "Press Me"}
            font={Fonts.h3}
            color={Colors.text}
          />
        </layout>
      </view>
    </layout>
  </Card>
</DemoSection>
```

### 3. Blur Effects (1.5 hours)

**Features:**
- Basic blur styles (light, dark, regular)
- System material blur styles
- Blur over image
- Blur over gradient
- Comparison of blur intensities
- Note: iOS-only, show platform detection

**Example:**
```typescript
interface BlurState {
  selectedBlurStyle: BlurStyle;
  showBlur: boolean;
}

<DemoSection title="Blur Effects">
  <Card>
    <label
      value="Note: Blur effects may be iOS-only"
      font={Fonts.caption}
      color={Colors.warning}
    />

    <layout>
      {/* Blur over image/gradient */}
      <view
        width="100%"
        height={200}
        background="linear-gradient(#667EEA, #764BA2)"
        borderRadius={BorderRadius.base}
      >
        {this.state.showBlur && (
          <blur
            width="100%"
            height="100%"
            blurStyle={this.state.selectedBlurStyle}
            borderRadius={BorderRadius.base}
          >
            <layout
              width="100%"
              height="100%"
              alignItems="center"
              justifyContent="center"
            >
              <label
                value="Blurred Content"
                font={Fonts.h2}
                color={Colors.white}
              />
            </layout>
          </blur>
        )}

        {!this.state.showBlur && (
          <layout
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
          >
            <label
              value="No Blur"
              font={Fonts.h2}
              color={Colors.white}
            />
          </layout>
        )}
      </view>

      {/* Blur toggle */}
      <Button
        title={this.state.showBlur ? "Hide Blur" : "Show Blur"}
        variant="primary"
        onTap={() => this.setState({ showBlur: !this.state.showBlur })}
      />

      {/* Blur style selector */}
      {this.state.showBlur && (
        <layout>
          <label value="Blur Style" font={Fonts.h3} />
          <layout flexDirection="row" flexWrap="wrap">
            <Button
              title="Light"
              variant={this.state.selectedBlurStyle === 'light' ? 'primary' : 'outline'}
              size="small"
              onTap={() => this.setState({ selectedBlurStyle: 'light' })}
            />
            <Button
              title="Dark"
              variant={this.state.selectedBlurStyle === 'dark' ? 'primary' : 'outline'}
              size="small"
              onTap={() => this.setState({ selectedBlurStyle: 'dark' })}
            />
            <Button
              title="Regular"
              variant={this.state.selectedBlurStyle === 'regular' ? 'primary' : 'outline'}
              size="small"
              onTap={() => this.setState({ selectedBlurStyle: 'regular' })}
            />
            <Button
              title="Prominent"
              variant={this.state.selectedBlurStyle === 'prominent' ? 'primary' : 'outline'}
              size="small"
              onTap={() => this.setState({ selectedBlurStyle: 'prominent' })}
            />
          </layout>
        </layout>
      )}

      {/* Blur comparison grid */}
      <label value="Blur Styles Comparison" font={Fonts.h3} />
      <layout flexDirection="row" flexWrap="wrap">
        {['light', 'dark', 'regular', 'prominent'].map(style => (
          <view
            key={style}
            width={160}
            height={120}
            background="linear-gradient(#FF6B6B, #4ECDC4)"
            borderRadius={BorderRadius.base}
            margin={Spacing.xs}
          >
            <blur
              width="100%"
              height="100%"
              blurStyle={style as BlurStyle}
              borderRadius={BorderRadius.base}
            >
              <layout
                width="100%"
                height="100%"
                alignItems="center"
                justifyContent="center"
              >
                <label
                  value={style}
                  font={Fonts.body}
                  color={style === 'dark' ? Colors.white : Colors.text}
                />
              </layout>
            </blur>
          </view>
        ))}
      </layout>
    </layout>
  </Card>
</DemoSection>
```

### 4. Opacity & Fading (1 hour)

**Features:**
- Opacity control slider
- Fade in/out animations
- Layered opacity (stacked elements)
- Disabled state simulation
- Ghost/placeholder elements

**State management:**
```typescript
interface OpacityState {
  opacity: number;
  fadeVisible: boolean;
}

private animateFade(show: boolean) {
  const options: PresetCurveAnimationOptions = {
    duration: 0.4,
    curve: AnimationCurve.EaseInOut,
  };

  this.animate(options, () => {
    this.setState({ fadeVisible: show });
  });
}
```

**UI structure:**
```typescript
<DemoSection title="Opacity & Fading">
  <Card>
    <layout>
      {/* Opacity slider */}
      <label
        value={`Opacity: ${(this.state.opacity * 100).toFixed(0)}%`}
        font={Fonts.h3}
      />

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

      {/* Opacity presets */}
      <layout flexDirection="row" flexWrap="wrap">
        {[0, 0.25, 0.5, 0.75, 1].map(op => (
          <Button
            key={op}
            title={`${(op * 100).toFixed(0)}%`}
            variant={this.state.opacity === op ? 'primary' : 'outline'}
            size="small"
            onTap={() => this.setState({ opacity: op })}
          />
        ))}
      </layout>

      {/* Fade animation demo */}
      <label value="Fade Animation" font={Fonts.h3} />

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

      <layout flexDirection="row">
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
```

### 5. Combined Effects Showcase (1.5 hours)

**Features:**
- Card with gradient + shadow + rounded corners
- Glassmorphism effect (blur + opacity + gradient)
- Neumorphism style (subtle shadows)
- Animated card that changes all properties
- Real-world UI examples (profile card, pricing card)

**Example:**
```typescript
<DemoSection title="Combined Effects">
  <Card>
    <label value="Glassmorphism Card" font={Fonts.h3} />

    {/* Background */}
    <view
      width="100%"
      height={250}
      background="linear-gradient(#667EEA, #764BA2)"
      borderRadius={BorderRadius.base}
      padding={Spacing.base}
    >
      {/* Glass card */}
      <view
        width="100%"
        height={200}
        backgroundColor="rgba(255, 255, 255, 0.1)"
        borderRadius={BorderRadius.base}
        boxShadow="0 8 32 rgba(0, 0, 0, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.2)"
      >
        <blur
          width="100%"
          height="100%"
          blurStyle="light"
          borderRadius={BorderRadius.base}
        >
          <layout
            width="100%"
            height="100%"
            padding={Spacing.base}
            justifyContent="center"
          >
            <label
              value="Glassmorphism"
              font={Fonts.h2}
              color={Colors.white}
            />
            <label
              value="Blur + transparency + border"
              font={Fonts.body}
              color="rgba(255, 255, 255, 0.8)"
            />
          </layout>
        </blur>
      </view>
    </view>

    {/* Neumorphism card */}
    <label value="Neumorphism Card" font={Fonts.h3} />

    <view
      width="100%"
      height={150}
      backgroundColor="#E0E5EC"
      borderRadius={BorderRadius.large}
      // Dual shadows for neumorphism effect
      boxShadow="10 10 20 rgba(163, 177, 198, 0.6), -10 -10 20 rgba(255, 255, 255, 0.5)"
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
      </layout>
    </view>

    {/* Premium pricing card example */}
    <label value="Premium Card Example" font={Fonts.h3} />

    <view
      width="100%"
      background="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
      borderRadius={BorderRadius.base}
      boxShadow="0 10 30 rgba(102, 126, 234, 0.4)"
      padding={Spacing.lg}
    >
      <layout>
        <label value="Premium" font={Fonts.h1} color={Colors.white} />
        <label value="$29/month" font={Fonts.h2} color="rgba(255, 255, 255, 0.9)" />
        <label
          value="All features included"
          font={Fonts.body}
          color="rgba(255, 255, 255, 0.7)"
        />
      </layout>
    </view>
  </Card>
</DemoSection>
```

## State Management

```typescript
interface StylingDemoState {
  // Gradients
  gradientType: 'sunset' | 'ocean' | 'forest' | 'custom';

  // Shadows
  elevationLevel: 'none' | 'light' | 'medium' | 'heavy';
  shadowColor: string;
  isPressed: boolean;

  // Blur
  selectedBlurStyle: BlurStyle;
  showBlur: boolean;

  // Opacity
  opacity: number;
  fadeVisible: boolean;
}
```

## Code Examples to Include

### Gradient Helper
```typescript
private getGradient(colors: string[], stops?: number[]): string {
  if (stops && stops.length === colors.length) {
    // Custom stops
    const colorStops = colors.map((color, i) => `${color} ${stops[i]}%`);
    return `linear-gradient(${colorStops.join(', ')})`;
  } else {
    // Even stops
    return `linear-gradient(${colors.join(', ')})`;
  }
}
```

### Shadow Elevation System
```typescript
// Material Design-inspired elevation
const Elevation = {
  none: "0 0 0 rgba(0, 0, 0, 0)",
  1: "0 1 3 rgba(0, 0, 0, 0.12)",
  2: "0 2 6 rgba(0, 0, 0, 0.16)",
  3: "0 4 12 rgba(0, 0, 0, 0.2)",
  4: "0 8 24 rgba(0, 0, 0, 0.24)",
  5: "0 16 48 rgba(0, 0, 0, 0.28)",
};
```

## Performance Considerations

1. **Gradient Performance**: Gradients may be slightly more expensive than solid colors
2. **Shadow Rendering**: Multiple shadows can impact performance - use sparingly
3. **Blur Effects**: BlurView is relatively expensive - avoid many blur views simultaneously
4. **Opacity Animation**: Animating opacity is GPU-accelerated and performant
5. **Platform Differences**: Blur effects may not be available on Android

## Platform Notes

**iOS:**
- Full gradient support
- Box shadows supported
- BlurView fully functional with many blur styles
- All effects perform well

**Android:**
- Gradient support confirmed
- Box shadows supported
- BlurView may not be available (check at runtime)
- Alternative: Use semi-transparent overlays instead of blur

## Estimated Effort

- **Linear gradients**: 1.5 hours
- **Box shadows & depth**: 2 hours
- **Blur effects**: 1.5 hours
- **Opacity & fading**: 1 hour
- **Combined effects**: 1.5 hours
- **Testing & polish**: 0.5 hours

**Total: 8 hours**

## Success Criteria

- [ ] Linear gradients display correctly with even stops
- [ ] Custom gradient stops work as expected
- [ ] Box shadows create depth perception
- [ ] Multiple elevation levels demonstrated
- [ ] Colored shadows (glows) working
- [ ] Blur effects work (on iOS)
- [ ] Platform detection for blur (Android fallback)
- [ ] Opacity control smooth and responsive
- [ ] Fade animations work correctly
- [ ] Combined effects showcase looks polished
- [ ] Glassmorphism effect visible
- [ ] All effects performant (60fps)
- [ ] Works on both iOS and Android (with platform checks)

## Advanced Techniques to Showcase

1. **Glassmorphism**: Blur + semi-transparent background + border
2. **Neumorphism**: Dual shadows (light and dark) for 3D effect
3. **Gradient Mesh**: Multiple overlapping gradients
4. **Animated Gradients**: Transitioning between gradient presets
5. **Shadow Stacking**: Multiple layers of shadows for depth

# Valdi Kitchen Sink

A comprehensive demonstration application showcasing all core features of the Valdi cross-platform UI framework. This app serves as both a learning resource and a testing ground for Valdi's capabilities.

## Overview

Valdi Kitchen Sink is a single-window demo app that demonstrates:
- **Layout System**: `<layout>`, `<view>`, and flexbox positioning
- **Text Elements**: `<label>`, `<textfield>`, `<textview>`, and rich text
- **State Management**: StatefulComponent and lifecycle methods
- **Animations**: Smooth transitions with the `animate()` API
- **Gestures**: Touch interactions and gesture handlers (planned)
- **Styling**: Gradients, shadows, borders, and transforms (planned)
- **Media**: Images and video elements (planned)
- **Navigation**: Page navigation with NavigationRoot
- **Reusable Components**: Design system with common UI components

## Project Structure

```
valdi-kitchen-sink/
├── IMPLEMENTATION_PLAN.md     # Detailed implementation roadmap
├── README.md                   # This file
├── package.json               # NPM dependencies
├── tsconfig.json              # TypeScript configuration
├── .eslintrc.js               # ESLint configuration
├── BUILD.bazel                # Root Bazel build file
└── modules/
    ├── common/                # Shared components and design system
    │   └── src/
    │       ├── theme/         # Colors, fonts, styles
    │       └── components/    # Button, Card, Header, etc.
    ├── main_app/              # Root app with navigation
    │   └── src/
    │       ├── App.tsx        # Root component
    │       └── HomePage.tsx   # Main menu
    ├── layouts_demo/          # Layout and flexbox examples
    ├── text_demo/             # Text elements demonstration
    ├── state_demo/            # State management examples
    └── animation_demo/        # Animation demonstrations
```

## Features Demonstrated

### 1. Common Module (Design System)

The `common` module provides a consistent design system across all demos:

**Theme System:**
- **Colors**: Primary, secondary, semantic (success, error, warning), grayscale
- **Fonts**: Typography scale (h1-h6, body, caption) using system fonts
- **Spacing**: Consistent spacing scale (xs to 5xl)
- **Shadows**: Shadow definitions for elevation
- **Border Radius**: Standard radius values

**Reusable Components:**
- **Button**: Configurable button with variants (primary, secondary, outline, ghost)
- **Card**: Container component with elevation and padding
- **Header**: Page header with title and back button
- **DemoSection**: Section wrapper with title and description
- **CodeBlock**: Display code snippets

### 2. Layouts Demo

Demonstrates Valdi's layout system:
- `<layout>` vs `<view>` (performance considerations)
- Flexbox direction (row, column)
- Justify content (flex-start, center, flex-end, space-between, space-around)
- Align items (flex-start, center, flex-end, stretch)
- Flex grow/shrink
- Gap property for spacing

### 3. Text Demo

Showcases text elements:
- `<label>`: Font sizes, colors, alignment, line limiting
- `<textfield>`: Single-line inputs with various keyboard types (email, number, password)
- `<textview>`: Multi-line text input
- **AttributedText**: Rich text with mixed styles using AttributedTextBuilder

### 4. State Demo

Demonstrates state management:
- **StatefulComponent**: Managing internal state with `setState()`
- **Multiple State Values**: Independent state variables in one component
- **Lifecycle Methods**: onCreate, onViewModelUpdate, onDestroy
- **State Updates**: Reactive re-rendering on state changes

### 5. Animation Demo

Shows Valdi's animation capabilities:
- **Color Animation**: Smooth backgroundColor transitions
- **Scale Animation**: Size changes with scaleX/scaleY
- **Position Animation**: Movement with translationX/translationY
- **Opacity Animation**: Fade in/out effects
- **Rotation Animation**: Rotating elements
- **Combined Animations**: Multiple properties animated together
- **Animation Curves**: easeIn, easeOut, easeInOut

## Design System

### Color Palette

```typescript
Primary:     #3B82F6 (Blue)
Secondary:   #8B5CF6 (Purple)
Success:     #10B981 (Green)
Warning:     #F59E0B (Amber)
Error:       #EF4444 (Red)
Background:  #F9FAFB (Light Gray)
Surface:     #FFFFFF (White)
```

### Typography

```typescript
H1: System-Bold 28pt
H2: System-Bold 24pt
H3: System-Bold 20pt
H4: System-Semibold 18pt
Body: System 16pt
Caption: System 14pt
```

### Spacing Scale

```typescript
xs:   4px
sm:   8px
md:   12px
base: 16px
lg:   20px
xl:   24px
2xl:  32px
```

## Key Valdi Concepts Demonstrated

### 1. Component Architecture

```typescript
export class MyComponent extends Component<MyViewModel> {
  onCreate() {
    // Initialize component
  }

  onRender() {
    <view>
      {/* JSX/TSX template */}
    </view>;
  }

  onDestroy() {
    // Cleanup
  }
}
```

### 2. Stateful Components

```typescript
export class Counter extends StatefulComponent<{}, State> {
  state: State = { count: 0 };

  onRender() {
    <view onTap={() => this.setState({ count: this.state.count + 1 })}>
      <label value={`Count: ${this.state.count}`} />
    </view>;
  }
}
```

### 3. Navigation

```typescript
<NavigationRoot>
  {$slot((navigationController) => {
    <HomePage navigationController={navigationController} />;
  })}
</NavigationRoot>
```

### 4. Animations

```typescript
this.animate(
  { duration: 0.3, curve: 'easeInOut' },
  () => {
    this.setState({ backgroundColor: 'blue' });
  }
);
```

### 5. Styling

```typescript
const styles = {
  container: new Style<View>({
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.base,
    boxShadow: Shadows.base,
    padding: Spacing.base,
  }),
};
```

## Usage as a Reference

This kitchen sink app serves multiple purposes:

1. **Learning Resource**: New Valdi developers can explore working examples of all core features
2. **Code Reference**: Copy-paste components and patterns into your own projects
3. **Testing Ground**: Test Valdi features in a complete application context
4. **Design System Template**: Use the common module as a starting point for your app's design system

## Best Practices Demonstrated

1. **Use `<layout>` over `<view>`** when you don't need visual styling (better performance)
2. **Organize with modules**: Separate concerns into dedicated modules
3. **Design system**: Centralize colors, fonts, and spacing for consistency
4. **Reusable components**: Build composable UI components
5. **Type safety**: Leverage TypeScript for better development experience
6. **Unidirectional data flow**: Props down, events up
7. **StatefulComponent**: Use for components with internal state
8. **Navigation patterns**: Use NavigationPageComponent for navigable pages

## Code Examples

### Creating a Custom Button

```typescript
import { Button } from '../common/src/components/Button';

<Button
  title="Click Me"
  variant="primary"
  size="medium"
  onTap={() => {
    // Handle tap
  }}
/>
```

### Building a Card Layout

```typescript
import { Card, DemoSection } from '../common/src/index';

<DemoSection title="My Section" description="Description here">
  <Card elevation="md">
    <label value="Card content" />
  </Card>
</DemoSection>
```

### Using the Theme

```typescript
import { Colors, Fonts, Spacing } from '../common/src/index';

<view
  backgroundColor={Colors.surface}
  padding={Spacing.base}
>
  <label
    font={Fonts.h3}
    color={Colors.primary}
    value="Styled text"
  />
</view>
```

## Building the App

This kitchen sink demo is designed as a reference and requires integration into a Valdi workspace:

### Option 1: Within Valdi Workspace

If you have Valdi installed, you can integrate this as part of the main Valdi workspace:

```bash
# Copy to Valdi apps directory
cp -r valdi-kitchen-sink /path/to/Valdi/apps/

# Build with Bazel (requires BUILD.bazel configuration)
cd /path/to/Valdi
bazel build //apps/valdi-kitchen-sink:kitchen_sink
```

### Option 2: Standalone Reference

Use this as a code reference without building:

1. Explore the modules to understand Valdi patterns
2. Copy components and patterns into your own Valdi project
3. Reference the design system (colors, fonts, spacing)
4. Study the demo pages for implementation examples

## Running the App

Once integrated into a Valdi workspace with proper BUILD.bazel configuration:

```bash
# Install for iOS
valdi install ios

# Install for Android
valdi install android

# Enable hot reload for development
valdi hotreload

# Run on simulator/emulator
# (Platform-specific commands via Xcode or Android Studio)
```

## Module Dependencies

Each demo module depends on:
- `valdi_core`: Core component system, styling, animations
- `valdi_tsx`: JSX/TSX support, native elements
- `valdi_navigation`: Navigation system (for demos)
- `common`: Shared design system and components

## Extending the App

To add new demo sections:

1. **Create a new module** in `modules/your_demo/src/`
2. **Define the demo component** extending NavigationPageComponent
3. **Add to HomePage** in the demoSections array
4. **Use common components** for consistency
5. **Follow the pattern** established by existing demos

## Learning Path

Recommended order for exploring demos:

1. **Layouts Demo** - Understand the layout system first
2. **Text Demo** - Learn text elements and input handling
3. **State Demo** - Grasp state management and lifecycle
4. **Animation Demo** - Add smooth transitions
5. **Other demos** - Explore gestures, styling, media, etc.

## Additional Resources

- [Valdi Documentation](../Valdi/docs/README.md)
- [Getting Started Guide](../Valdi/docs/start-install.md)
- [API Reference](../Valdi/docs/api/api-reference-elements.md)
- [Valdi Style Guide](../Valdi/docs/workflow-style-guide.md)

## Contributing

This kitchen sink demo can be extended with:
- Additional demo modules (gestures, media, forms, etc.)
- More reusable components
- Enhanced examples and code snippets
- Interactive tutorials
- Performance demonstrations

## License

Same license as the Valdi framework.

## Summary

Valdi Kitchen Sink provides a comprehensive, well-organized demonstration of Valdi's core features. Use it as a learning resource, code reference, and template for building beautiful cross-platform applications with Valdi.

**Key Takeaways:**
- Valdi compiles TypeScript to native iOS/Android views
- Component-based architecture with lifecycle methods
- Flexbox layout system like web/React
- Type-safe with full TypeScript support
- Hot reload for fast iteration
- True native performance without web views
- Write once, run everywhere (iOS, Android, macOS)

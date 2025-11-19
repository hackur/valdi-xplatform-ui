# Valdi Kitchen Sink - Architecture Documentation

## Overview

The Valdi Kitchen Sink is a comprehensive demo application showcasing all major features of the Valdi cross-platform UI framework. It demonstrates best practices, design patterns, and provides working examples for iOS and Android development.

## Project Structure

```
Valdi/
├── apps/
│   └── kitchen_sink/                 # Main application
│       ├── BUILD.bazel              # Root build configuration
│       └── modules/                 # Feature modules
│           ├── main_app/            # Entry point and homepage
│           ├── common/              # Shared components and utilities
│           ├── layouts_demo/        # ✅ Layout & flexbox demo
│           ├── text_demo/           # ✅ Text styling demo
│           ├── state_demo/          # ✅ State management demo
│           ├── animation_demo/      # ✅ Animations demo
│           ├── slots_demo/          # ✅ Slots & composition demo
│           ├── images_demo/         # 🚧 Placeholder - Images & Media
│           ├── scrolling_demo/      # 🚧 Placeholder - Scrolling & Lists
│           ├── gestures_demo/       # 🚧 Placeholder - Gestures
│           ├── styling_demo/        # 🚧 Placeholder - Advanced Styling
│           ├── shapes_demo/         # 🚧 Placeholder - Shapes & Paths
│           ├── forms_demo/          # 🚧 Placeholder - Forms & Validation
│           └── lists_demo/          # 🚧 Placeholder - Dynamic Lists
│
├── src/
│   └── valdi_modules/               # Valdi framework modules
│       └── src/valdi/
│           ├── valdi_core/          # Core framework (Component, State, etc.)
│           ├── valdi_tsx/           # TSX rendering engine
│           └── valdi_navigation/    # Navigation system
│
└── bzl/valdi/                       # Bazel build rules
```

## Architecture Principles

### 1. **Modular Design**

Each demo is a self-contained module with:
- **Isolated dependencies** - Only depends on what it needs (common, framework modules)
- **Clear boundaries** - Each module has its own BUILD.bazel file
- **Independent development** - Modules can be worked on without affecting others

**Example module structure:**
```
text_demo/
├── BUILD.bazel                      # Module build configuration
└── src/
    └── TextDemo.tsx                 # Main component
```

### 2. **Component Architecture**

The application follows a component-based architecture:

```
App (Entry Point)
 └─> NavigationRoot
      └─> HomePage (Navigation Hub)
           ├─> LayoutsDemo
           ├─> TextDemo
           ├─> StateDemo
           ├─> AnimationDemo
           ├─> SlotsDemo
           └─> [Placeholder Demos...]
```

**Component Hierarchy:**
1. **App.tsx** - Application entry point, sets up navigation
2. **HomePage.tsx** - Landing page with demo grid
3. **Demo Components** - Individual feature demonstrations
4. **Common Components** - Reusable UI elements (Header, Card, Button, etc.)

### 3. **Navigation System**

The navigation system uses Valdi's built-in navigation framework:

```typescript
// App.tsx - Sets up navigation root
<NavigationRoot>
  {$slot((navigationController: NavigationController) => {
    <HomePage navigationController={navigationController} />
  })}
</NavigationRoot>

// HomePage.tsx - Navigates to demos
navController.push(
  DemoComponent,
  { navigationController: navController },
  {}
);
```

**Key Concepts:**
- **NavigationRoot** - Provides navigation context to entire app
- **NavigationController** - Manages navigation stack (push/pop)
- **@NavigationPage** decorator - Registers components as pages
- **$slot()** compiler intrinsic - Required for NavigationRoot pattern

**Cross-Platform Compatibility:**

The navigation system has platform-specific considerations. See `HomePage.tsx` and `NavigationPageComponent.ts` for detailed documentation on the Android initialization issue with NavigationPageComponent.

## Build System (Bazel)

The project uses Bazel for building, which provides:
- **Hermetic builds** - Reproducible builds across environments
- **Incremental compilation** - Only rebuilds what changed
- **Multi-platform support** - Single build system for iOS and Android

### Build Configuration

**Root BUILD.bazel:**
```python
valdi_app(
    name = "kitchen_sink",
    root_component_path = "App@main_app/src/App",
    deps = ["//apps/kitchen_sink/modules/main_app"],
)
```

**Module BUILD.bazel:**
```python
valdi_module(
    name = "text_demo",
    srcs = glob(["src/**/*.ts", "src/**/*.tsx"]),
    deps = [
        "//src/valdi_modules/src/valdi/valdi_core",
        "//src/valdi_modules/src/valdi/valdi_tsx",
        "//apps/kitchen_sink/modules/common",
    ],
)
```

## Component Patterns

### 1. **Stateless Components**

For components that only render based on props:

```typescript
import { Component } from 'valdi_core/src/Component';

interface MyComponentViewModel {
  title: string;
}

class MyComponent extends Component<MyComponentViewModel> {
  onRender() {
    <label value={this.viewModel.title} />;
  }
}
```

### 2. **Stateful Components**

For components with internal state:

```typescript
import { StatefulComponent } from 'valdi_core/src/Component';

interface MyState {
  counter: number;
}

class MyComponent extends StatefulComponent<MyViewModel, MyState> {
  state: MyState = { counter: 0 };

  onRender() {
    <button onTap={() => this.setState({ counter: this.state.counter + 1 })}>
      <label value={`Count: ${this.state.counter}`} />
    </button>;
  }
}
```

### 3. **Slot-Based Composition**

For reusable container components:

```typescript
class Card extends Component {
  onRender() {
    <view style={cardStyle}>
      <slot /> {/* Projects child content here */}
    </view>;
  }
}

// Usage
<Card>
  <label value="Card content" />
</Card>
```

## State Management

### State Flow

```
User Interaction
  ↓
Event Handler (onTap, etc.)
  ↓
setState({ ... })
  ↓
State Merge (shallow merge)
  ↓
onRender() called
  ↓
UI Updates
```

### Best Practices

1. **Never mutate state directly** - Always use `setState()`
2. **Use immutable updates** - Spread operator for arrays/objects
3. **Keep state minimal** - Derive computed values in render
4. **Group related updates** - Single `setState()` call for efficiency

## Cross-Platform Considerations

### Android-Specific Issues

**NavigationPageComponent Initialization Problem:**

The `NavigationPageComponent` base class has a field initializer that executes before the component context is available on Android (works on iOS):

```typescript
// In NavigationPageComponent (framework code)
navigationController = new NavigationController(this.context.navigator); // Fails on Android
```

**Solution:**
Use `Component` + `@NavigationPage` decorator instead:

```typescript
@NavigationPage(module)
export class MyPage extends Component<MyViewModel> {
  // Access navigation via viewModel instead
}
```

See `HomePage.tsx` and `NavigationPageComponent.ts` for detailed documentation.

## Common Module

The `common` module provides shared utilities:

### Components
- **Header** - Page header with back button
- **DemoSection** - Section container with title/description
- **Card** - Content card with shadow
- **Button** - Styled button with variants
- **DemoCard** - Feature card for homepage

### Utilities
- **Colors** - Color palette constants
- **Fonts** - Typography definitions
- **Spacing** - Spacing scale
- **BorderRadius** - Border radius values
- **Shadows** - Shadow presets

## Performance Considerations

1. **Component Granularity**
   - Keep components focused and single-purpose
   - Avoid deep nesting where possible
   - Use composition over complex prop drilling

2. **State Updates**
   - Batch related state updates
   - Avoid unnecessary re-renders
   - Use immutable update patterns

3. **Animations**
   - Prefer transform/opacity (GPU-accelerated)
   - Keep durations short (150-400ms)
   - Limit concurrent animations

## Testing Strategy

While tests are not yet implemented, the recommended strategy would be:

1. **Unit Tests** - Test individual component logic
2. **Integration Tests** - Test navigation flows
3. **Visual Regression Tests** - Test UI consistency
4. **Cross-Platform Tests** - Verify iOS/Android parity

## Future Enhancements

The placeholder demos indicate planned features:

1. **Images & Media** - Image loading, scaling, video playback
2. **Scrolling & Lists** - Advanced scrolling, virtualization
3. **Gestures** - Tap, drag, pinch, rotate handling
4. **Advanced Styling** - Gradients, shadows, transforms
5. **Shapes & Paths** - Custom shape drawing
6. **Forms & Validation** - Form handling and validation
7. **Dynamic Lists** - Advanced list operations

## Contributing

See CONTRIBUTING.md for guidelines on:
- Adding new demos
- Following code standards
- Submitting pull requests
- Reporting issues

## References

- [Valdi Framework Documentation](https://github.com/valdi-labs/valdi)
- [Bazel Build System](https://bazel.build/)
- Android-specific notes: See ANDROID.md
- Troubleshooting: See TROUBLESHOOTING.md

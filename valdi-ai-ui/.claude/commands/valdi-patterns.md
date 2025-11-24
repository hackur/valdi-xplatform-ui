# Valdi Framework Patterns

## Usage
This command provides Valdi framework-specific patterns and best practices for Snapchat Valdi development.

## Context
Reference this when writing Valdi components, using lifecycle methods, or implementing Valdi-specific patterns.

## Task
When invoked, ensure all code follows these Valdi framework patterns:

### Component Architecture

#### Base Classes
- **Component<TViewModel, TState>** - Basic component with ViewModel only
- **StatefulComponent<TProps, TState>** - Component with both props and internal state
- **NavigationPageComponent<TViewModel>** - Navigation-aware page component
- **NavigationPageStatefulComponent<TViewModel, TState>** - Stateful navigation page

#### Lifecycle Methods Pattern
```typescript
export class MyComponent extends Component<Props> {
  // 1. onCreate() - Called once when component is created
  override onCreate(): void {
    // Subscribe to stores, load data, setup listeners
  }

  // 2. onMount() - Called when mounted to view hierarchy
  override onMount(): void {
    // DOM-related setup if needed
  }

  // 3. onRender() - REQUIRED - Returns JSX
  override onRender(): JSX.Element {
    return <view style={styles.container} />;
  }

  // 4. onViewModelUpdate() - Called when props change
  override onViewModelUpdate(previousViewModel?: Props): void {
    // React to prop changes
  }

  // 5. onUpdate() - Called after any update
  override onUpdate(): void {
    // Post-update logic
  }

  // 6. onUnmount() - Called when removed from view
  override onUnmount(): void {
    // Cleanup that requires view access
  }

  // 7. onDestroy() - CRITICAL - Final cleanup
  override onDestroy(): void {
    // ALWAYS unsubscribe from stores
    // ALWAYS clear timers/intervals
    // ALWAYS remove event listeners
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
}
```

### Observable Store Pattern
```typescript
export class MyStore {
  private state: State = { /* initial */ };
  private listeners: Set<(state: State) => void> = new Set();

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  updateState(changes: Partial<State>): void {
    // Update immutably
    this.state = { ...this.state, ...changes };
    this.notify();
  }
}

// Usage in component
private unsubscribe?: () => void;

override onCreate(): void {
  this.unsubscribe = this.messageStore.subscribe((state) => {
    this.setState({ messages: state.messages });
  });
}

override onDestroy(): void {
  if (this.unsubscribe) {
    this.unsubscribe();
    this.unsubscribe = undefined;
  }
}
```

### Navigation Pattern
```typescript
// Access navigation controller
this.viewModel.navigationController.push(ChatView, {
  navigationController: this.viewModel.navigationController, // Pass through!
  conversationId: conv.id,
});

// Navigate back
this.viewModel.navigationController.pop();

// Props interface for navigation pages
export interface ChatViewProps {
  navigationController: NavigationController; // REQUIRED
  conversationId: string;
}
```

### Event Handler Pattern
```typescript
// Use arrow functions for correct 'this' binding
private handleTap = (): void => {
  const { disabled, onTap } = this.viewModel;
  if (!disabled && onTap) {
    onTap();
  }
};

// Use in JSX
<view onTap={this.handleTap}>
```

### JSX Elements
```typescript
// Available native elements (lowercase!)
<view>         // Container (UIView/View)
<scroll>       // Scrollable container
<label>        // Text display
<textfield>    // Single-line input
<textview>     // Multi-line input
<image>        // Image display
<spinner>      // Loading indicator
<shape>        // Custom shapes
<blur>         // Blur effect
<slot>         // Content slot
```

### Common Anti-Patterns
```typescript
// [FAIL] WRONG - Forgetting to unsubscribe
override onCreate() {
  this.store.subscribe(this.handleUpdate); // Memory leak!
}

// [PASS] CORRECT
private unsubscribe?: () => void;
override onCreate() {
  this.unsubscribe = this.store.subscribe(this.handleUpdate);
}
override onDestroy() {
  if (this.unsubscribe) this.unsubscribe();
}

// [FAIL] WRONG - Not passing navigationController
<ChatView conversationId={id} />

// [PASS] CORRECT
<ChatView
  navigationController={this.viewModel.navigationController}
  conversationId={id}
/>

// [FAIL] WRONG - Missing override keyword
onCreate() { }

// [PASS] CORRECT
override onCreate() { }

// [FAIL] WRONG - Regular function (wrong 'this')
private handleTap(): void { }

// [PASS] CORRECT
private handleTap = (): void => { };
```

### Component Structure Template
```typescript
import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Spacing } from 'common/src/theme';

export interface MyComponentProps {
  title: string;
  onTap?: () => void;
}

export class MyComponent extends Component<MyComponentProps> {
  static defaultProps: Partial<MyComponentProps> = {
    // Optional prop defaults
  };

  override onCreate(): void {
    // Setup logic
  }

  private handleTap = (): void => {
    const { onTap } = this.viewModel;
    if (onTap) onTap();
  };

  override onRender(): JSX.Element {
    const { title } = this.viewModel;
    return (
      <view style={styles.container} onTap={this.handleTap}>
        <label value={title} style={styles.title} />
      </view>
    );
  }

  override onDestroy(): void {
    // Cleanup
  }
}

const styles = {
  container: new Style<View>({
    flex: 1,
    backgroundColor: Colors.surface,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
  }),
  title: new Style({
    fontSize: 16,
    color: Colors.textPrimary,
  }),
};
```

## Key Principles
1. **Always use override keyword** for lifecycle methods (tsconfig noImplicitOverride)
2. **Always unsubscribe** in onDestroy() to prevent memory leaks
3. **Arrow functions for handlers** to preserve 'this' context
4. **Pass navigationController** through navigation hierarchy
5. **Use lowercase JSX elements** (Valdi convention)
6. **Styles outside component class** for reusability
7. **Singleton stores** for global state management
8. **Type-safe props and state** with explicit interfaces

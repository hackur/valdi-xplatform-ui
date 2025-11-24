# Component Generator

Generate new Valdi framework components with proper structure and boilerplate.

## Usage

Arguments: `<component-type> <component-name> [module-name]`

Types: `screen`, `component`, `viewmodel`, `service`

Examples:
- `/component-gen screen UserProfile users`
- `/component-gen component Button ui`
- `/component-gen service Analytics analytics_core`

## Task

Based on the component type and name, generate the appropriate files with proper Valdi framework patterns.

### For Screen (VScreen)

Create: `modules/{module}/src/screens/{Name}Screen.tsx`

```typescript
import { VScreen, VScreenProps } from '@valdi/core';
import { {Name}ViewModel } from '../viewmodels/{Name}ViewModel';

export interface {Name}ScreenProps extends VScreenProps<{Name}ViewModel> {
  // Add custom props
}

export class {Name}Screen extends VScreen<{Name}ViewModel> {
  constructor(props: {Name}ScreenProps) {
    super(props);
  }

  override onViewModelCreated(): void {
    // Initialize viewModel subscriptions
  }

  override render() {
    return (
      <View style={styles.container}>
        {/* Screen content */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Also create the ViewModel file and test file.

### For Component (VComponent)

Create: `modules/{module}/src/components/{Name}.tsx`

```typescript
import { VComponent, VComponentProps } from '@valdi/core';
import { z } from 'zod';

const {Name}PropsSchema = z.object({
  // Define props schema
});

export interface {Name}Props extends VComponentProps {
  // Props from schema
}

export class {Name} extends VComponent<{Name}Props> {
  constructor(props: {Name}Props) {
    super(props);
  }

  override render() {
    return (
      <View style={styles.container}>
        {/* Component content */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
```

Also create test file.

### For ViewModel

Create: `modules/{module}/src/viewmodels/{Name}ViewModel.ts`

```typescript
import { ViewModel } from '@valdi/core';
import { makeAutoObservable } from 'mobx';

export class {Name}ViewModel extends ViewModel {
  // Observable state
  private _isLoading = false;

  constructor() {
    super();
    makeAutoObservable(this);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  // Actions
  async initialize(): Promise<void> {
    // Initialization logic
  }

  override dispose(): void {
    // Cleanup
    super.dispose();
  }
}
```

Also create test file.

### For Service

Create: `modules/{module}/src/services/{Name}Service.ts`

```typescript
import { Service } from '@valdi/core';

export class {Name}Service extends Service {
  private static instance: {Name}Service;

  private constructor() {
    super();
  }

  static getInstance(): {Name}Service {
    if (!{Name}Service.instance) {
      {Name}Service.instance = new {Name}Service();
    }
    return {Name}Service.instance;
  }

  // Service methods
  async someMethod(): Promise<void> {
    // Implementation
  }
}

export const {name}Service = {Name}Service.getInstance();
```

Also create test file.

## Post-Generation

1. Create test file: `__tests__/{Name}.test.ts(x)`
2. Add exports to module's index.ts
3. Run type check: `npx tsc --noEmit`
4. Run tests: `npm test {Name}`

## Output Format

```
✨ Component Generated Successfully
====================================

📁 Files Created:
   ✅ modules/{module}/src/[type]/{Name}.[ext]
   ✅ modules/{module}/src/__tests__/{Name}.test.[ext]
   ✅ Updated modules/{module}/src/index.ts

🔍 Next Steps:
   1. Implement component logic
   2. Add tests
   3. Import in parent component
   4. Run: npm test {Name}

📖 Documentation:
   - Valdi Framework Guide: docs/valdi-framework.md
   - Component Patterns: docs/component-patterns.md
```

Generate clean, production-ready code following all Valdi framework conventions.

# Style Patterns - Native-First

## Usage
Reference this for correct styling in Valdi components.

## CRITICAL: Think Native First!

Valdi's `Style` object maps directly to **native UI properties** (UIView on iOS, View on Android), NOT to CSS or React Native!

## CRITICAL: Style Type Pattern

NEVER use generic type parameters with Style. TypeScript infers the type automatically.

```typescript
// [FAIL] WRONG - Do not use type parameters
new Style({...})
new Style<Label>({...})
: Style<View>

// [PASS] CORRECT - Let TypeScript infer
new Style({...})
: Style
```

Run `./scripts/fix-style-types.sh` to auto-fix violations.

## Style Object Pattern
```typescript
import { Style } from 'valdi_core/src/Style';
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Spacing, Fonts, BorderRadius } from 'common/src/theme';

// Define styles OUTSIDE component class
const styles = {
  container: new Style({
    flex: 1,
    backgroundColor: Colors.surface,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
  }),
  title: new Style({
    fontSize: Fonts.h1.fontSize,
    fontWeight: Fonts.h1.fontWeight,
    color: Colors.textPrimary,
    lineHeight: Fonts.h1.lineHeight,
  }),
};

// Use in component
export class MyComponent extends Component<Props> {
  override onRender(): JSX.Element {
    return (
      <view style={styles.container}>
        <label value="Title" style={styles.title} />
      </view>
    );
  }
}
```

## Supported Properties

### Layout Properties
```typescript
new Style({
  // Flexbox
  flex: 1,                    // Flex grow factor
  flexDirection: 'row',       // 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap: 'wrap',           // 'wrap' | 'nowrap' | 'wrap-reverse'
  alignItems: 'center',       // 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  alignSelf: 'flex-start',    // Override alignItems for this item
  justifyContent: 'flex-start', // 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'

  // Sizing
  width: 100,                 // number or string ('100%')
  height: 50,
  minWidth: 50,
  minHeight: 30,
  maxWidth: 200,
  maxHeight: 100,

  // Position
  position: 'absolute',       // 'relative' | 'absolute'
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
})
```

### Spacing Properties (NO SHORTHANDS!)
```typescript
// WRONG - React Native shorthands (NOT SUPPORTED)
new Style({
  gap: 16,                    // ERROR - gap doesn't exist
  paddingVertical: 8,         // ERROR - no shorthand
  paddingHorizontal: 16,      // ERROR - no shorthand
  marginVertical: 8,          // ERROR - no shorthand
  marginHorizontal: 12,       // ERROR - no shorthand
  padding: 16,                // ERROR - no universal padding
  margin: 8,                  // ERROR - no universal margin
})

// CORRECT - Individual properties (SUPPORTED)
new Style({
  // Padding (individual sides only!)
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,

  // Margin (individual sides only!)
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 12,
  marginRight: 12,
})
```

### Visual Properties
```typescript
new Style({
  // Background
  backgroundColor: Colors.surface,  // Hex or named color
  opacity: 0.8,                     // 0.0 to 1.0

  // Border
  borderRadius: BorderRadius.base,  // All corners
  borderTopLeftRadius: 8,           // Individual corners
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  borderWidth: 1,
  borderColor: Colors.border,
  borderTopWidth: 1,                // Individual sides
  borderBottomWidth: 1,
  borderLeftWidth: 1,
  borderRightWidth: 1,

  // Transform
  transform: 'rotate(45deg)',
  transformOrigin: 'center',
})
```

### Shadow Properties (iOS Style)
```typescript
new Style({
  // Shadow (iOS-style API)
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,

  // Android elevation (if supported)
  elevation: 4,
})
```

### Text Properties
```typescript
new Style({
  // Font
  fontSize: 16,
  fontWeight: '400',        // '100' to '900' or 'normal' | 'bold'
  fontFamily: 'System',
  lineHeight: 24,
  letterSpacing: 0.5,

  // Alignment
  textAlign: 'left',        // 'left' | 'center' | 'right' | 'justify'
  textAlignVertical: 'top', // 'top' | 'center' | 'bottom'

  // Color
  color: Colors.textPrimary,

  // Decoration
  textDecorationLine: 'underline', // 'none' | 'underline' | 'line-through' | 'underline line-through'
  textDecorationColor: Colors.primary,
  textTransform: 'uppercase',      // 'none' | 'uppercase' | 'lowercase' | 'capitalize'
})
```

## Design System Usage

### Always Use Theme Tokens
```typescript
import { Colors, Spacing, Fonts, BorderRadius } from 'common/src/theme';

// CORRECT - Use design tokens
const styles = {
  container: new Style({
    backgroundColor: Colors.surface,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.md,
  }),
  title: new Style({
    fontSize: Fonts.h2.fontSize,
    fontWeight: Fonts.h2.fontWeight,
    lineHeight: Fonts.h2.lineHeight,
    color: Colors.textPrimary,
  }),
};

// WRONG - Hardcoded values
const styles = {
  container: new Style({
    backgroundColor: '#FFFFFF',     // Use Colors.surface
    paddingTop: 16,                 // Use Spacing.base
    paddingBottom: 16,
    paddingLeft: 24,                // Use Spacing.lg
    paddingRight: 24,
    borderRadius: 12,               // Use BorderRadius.md
  }),
  title: new Style({
    fontSize: 28,                   // Use Fonts.h2.fontSize
    fontWeight: '700',              // Use Fonts.h2.fontWeight
    color: '#000000',               // Use Colors.textPrimary
  }),
};
```

### Available Design Tokens
```typescript
// Colors (60+ semantic colors)
Colors.primary              // #007AFF
Colors.secondary           // #5856D6
Colors.success             // #34C759
Colors.warning             // #FF9500
Colors.error               // #FF3B30
Colors.background          // #F2F2F7
Colors.surface             // #FFFFFF
Colors.border              // #C6C6C8
Colors.textPrimary         // #000000
Colors.textSecondary       // #6B6B6B
Colors.textTertiary        // #999999
Colors.textInverse         // #FFFFFF

// Spacing
Spacing.xxs                // 2
Spacing.xs                 // 4
Spacing.sm                 // 8
Spacing.base               // 16
Spacing.md                 // 20
Spacing.lg                 // 24
Spacing.xl                 // 32
Spacing.xxl                // 48

// Fonts
Fonts.h1                   // { fontSize: 32, fontWeight: '700', lineHeight: 40 }
Fonts.h2                   // { fontSize: 28, fontWeight: '700', lineHeight: 36 }
Fonts.h3                   // { fontSize: 24, fontWeight: '600', lineHeight: 32 }
Fonts.body                 // { fontSize: 16, fontWeight: '400', lineHeight: 24 }
Fonts.caption              // { fontSize: 12, fontWeight: '400', lineHeight: 16 }

// Border Radius
BorderRadius.sm            // 4
BorderRadius.base          // 8
BorderRadius.md            // 12
BorderRadius.lg            // 16
BorderRadius.full          // 9999
```

## Common Patterns

### Container Pattern
```typescript
const styles = {
  container: new Style({
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
  }),
};
```

### Card Pattern
```typescript
const styles = {
  card: new Style({
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,

    // Shadow (iOS)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Elevation (Android)
    elevation: 2,
  }),
};
```

### Row Layout Pattern
```typescript
const styles = {
  row: new Style({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  // Children spacing (use marginRight on children)
  rowItem: new Style({
    marginRight: Spacing.sm, // Space between items
  }),
};
```

### Column Layout Pattern
```typescript
const styles = {
  column: new Style({
    flexDirection: 'column',
    alignItems: 'stretch',
  }),

  // Children spacing (use marginBottom on children)
  columnItem: new Style({
    marginBottom: Spacing.base, // Space between items
  }),
};
```

### Button Pattern
```typescript
const styles = {
  button: new Style({
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  buttonText: new Style({
    fontSize: Fonts.body.fontSize,
    fontWeight: '600',
    color: Colors.textInverse,
  }),
};
```

### Absolute Positioning Pattern
```typescript
const styles = {
  overlay: new Style({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  }),
};
```

## Anti-Patterns

### DON'T Use Shorthands
```typescript
// WRONG
new Style({
  gap: Spacing.base,
  paddingVertical: Spacing.sm,
  paddingHorizontal: Spacing.lg,
})

// CORRECT
new Style({
  paddingTop: Spacing.sm,
  paddingBottom: Spacing.sm,
  paddingLeft: Spacing.lg,
  paddingRight: Spacing.lg,
  // Use marginRight or marginBottom on children for spacing
})
```

### DON'T Hardcode Values
```typescript
// WRONG
new Style({
  paddingTop: 16,
  backgroundColor: '#FFFFFF',
})

// CORRECT
new Style({
  paddingTop: Spacing.base,
  backgroundColor: Colors.surface,
})
```

### DON'T Define Styles Inside Render
```typescript
// WRONG - Creates new objects every render
override onRender(): JSX.Element {
  const containerStyle = new Style({ /* ... */ });
  return <view style={containerStyle} />;
}

// CORRECT - Define outside component
const styles = {
  container: new Style({ /* ... */ }),
};

export class MyComponent extends Component<Props> {
  override onRender(): JSX.Element {
    return <view style={styles.container} />;
  }
}
```

### DON'T Use CSS-Style Units
```typescript
// WRONG
new Style({
  width: '100px',      // NO px units
  padding: '1rem',     // NO rem units
  margin: '2em',       // NO em units
})

// CORRECT
new Style({
  width: 100,          // Numbers are points/dp
  width: '100%',       // Percentages OK
})
```

## Dynamic Styles
```typescript
// Conditional styles
private getContainerStyle(): Style {
  return new Style({
    backgroundColor: this.viewModel.isActive
      ? Colors.primary
      : Colors.surface,
    opacity: this.viewModel.disabled ? 0.5 : 1.0,
  });
}

override onRender(): JSX.Element {
  return <view style={this.getContainerStyle()} />;
}

// Combined styles (if supported)
<view style={[styles.base, styles.variant]} />
```

## Remember
1. **Native properties only** - No CSS or React Native shorthands
2. **Individual spacing** - paddingTop/Bottom/Left/Right, no shorthands
3. **Design tokens** - Always use Colors, Spacing, Fonts, BorderRadius
4. **Styles outside class** - Define before component for reusability
5. **No gap property** - Use marginRight/marginBottom on children
6. **Number units** - No 'px', 'rem', 'em' - just numbers
7. **Think UIView/View** - Native UI component properties only

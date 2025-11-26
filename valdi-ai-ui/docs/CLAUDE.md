# GOLDEN RULES

- The year is 2025 but when you search use the versions of things that match the project's dependencies
- Never ever use emoji or icons unless you are specifically instructed to.
- Use a professional voice and make sure to consider this is a Snapchat Valdi UI project do online research to make sure you're using typescript correctly.
- when you're looking for files or occurances of text in code make sure to filter things out with grep but use things like "ag" commands or include before/after 3 lines context for occurances and then have more broad text and case insensivtive so we can see all occurances and get full picture.

# VALDI API PATTERNS

## 1. Style Patterns

### Always Use Style<T> Type Parameters

ALWAYS use `Style<View>` or `Style<Label>` type parameters! The Valdi compiler REQUIRES these.

```typescript
// [FAIL] WRONG - Missing type parameter (Bazel build will FAIL)
new Style({...})

// [FAIL] WRONG - Inline styles not supported
<view style={{ flexDirection: 'row' }}>

// [PASS] CORRECT - View styles for <view> elements
const containerStyle = new Style<View>({
  flexDirection: 'row',
  backgroundColor: Colors.surface,
})

// [PASS] CORRECT - Label styles for <label> elements (with font property)
const textStyle = new Style<Label>({
  font: systemBoldFont(16),
  color: Colors.textPrimary,
})
```

**When to use which:**
- `Style<View>` - Containers, layouts, wrappers (most common)
- `Style<Label>` - Text styles with `font` property

**Why required:** The type parameter `<T>` tells the Valdi compiler which native element type the style applies to. Without it, the Bazel/Valdi build fails.

### Label Font Property

Label styles use the `font` property, NOT `fontSize` or `fontWeight`:

```typescript
// [FAIL] WRONG - fontSize/fontWeight not supported on Label
new Style<Label>({
  fontSize: 16,
  fontWeight: 'bold',
})

// [PASS] CORRECT - Use font property with Valdi font functions
new Style<Label>({
  font: systemBoldFont(16),      // Bold text
  color: Colors.textPrimary,
})

new Style<Label>({
  font: systemFont(14),           // Regular text
  color: Colors.textSecondary,
})
```

Run `./scripts/fix-style-types.sh` to add missing type parameters.

## 2. Layout Properties

### Use Explicit Flex Properties

Valdi uses `flexGrow` and `flexShrink` instead of the shorthand `flex`:

```typescript
// [FAIL] WRONG - flex shorthand not supported
new Style<View>({
  flex: 1,
})

// [PASS] CORRECT - Use flexGrow/flexShrink explicitly
new Style<View>({
  flexGrow: 1,
  flexShrink: 1,
})
```

### Use Individual Padding Properties

No shorthand padding properties - use individual sides:

```typescript
// [FAIL] WRONG - paddingHorizontal/paddingVertical not supported
new Style<View>({
  paddingHorizontal: 16,
  paddingVertical: 8,
})

// [PASS] CORRECT - Use individual padding properties
new Style<View>({
  paddingTop: 8,
  paddingRight: 16,
  paddingBottom: 8,
  paddingLeft: 16,
})

// [PASS] CORRECT - Or use padding for uniform spacing
new Style<View>({
  padding: 16,  // All sides
})
```

### Use Individual Margin Properties

No shorthand margin properties - use individual sides:

```typescript
// [FAIL] WRONG - marginHorizontal/marginVertical not supported
new Style<View>({
  marginHorizontal: 16,
  marginVertical: 8,
})

// [PASS] CORRECT - Use individual margin properties
new Style<View>({
  marginTop: 8,
  marginRight: 16,
  marginBottom: 8,
  marginLeft: 16,
})

// [PASS] CORRECT - Or use margin for uniform spacing
new Style<View>({
  margin: 16,  // All sides
})
```

### Border Width Limitations

Only uniform `borderWidth` is supported:

```typescript
// [FAIL] WRONG - Individual border sides not supported
new Style<View>({
  borderBottomWidth: 1,
  borderTopWidth: 2,
})

// [PASS] CORRECT - Use uniform borderWidth only
new Style<View>({
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 8,
})
```

## 3. Element Names

Valdi uses lowercase element names that differ from React Native:

```typescript
// [FAIL] WRONG - React Native names
<ScrollView>
  <View>
    <Text>Hello</Text>
  </View>
</ScrollView>

// [PASS] CORRECT - Valdi lowercase element names
<scroll>
  <view>
    <label>Hello</label>
  </view>
</scroll>
```

### Element Name Reference

| React Native | Valdi | Notes |
|--------------|-------|-------|
| `<ScrollView>` | `<scroll>` | Scrollable container |
| `<View>` | `<view>` | Container element |
| `<Text>` | `<label>` | Text display |
| `<TextInput>` (single-line) | `<textfield>` | Single-line text input |
| `<TextInput multiline>` | `<textview>` | Multi-line text input |

## 4. TextField Callbacks and Props

### onChange with EditTextEvent

TextField uses `onChange` callback with `EditTextEvent` (has `.text` property):

```typescript
// [FAIL] WRONG - onValueChange/onViewChange not supported
<textfield
  onValueChange={(value) => setName(value)}
/>

// [FAIL] WRONG - EditTextEvent has .text, not .value
<textfield
  onChange={(e) => setName(e.value)}
/>

// [PASS] CORRECT - onChange with EditTextEvent.text
<textfield
  value={name}
  onChange={(e: EditTextEvent) => setName(e.text)}
/>
```

### Editable Property

Use `editable` prop, NOT `disabled`:

```typescript
// [FAIL] WRONG - disabled prop not supported
<textfield
  value={name}
  disabled={true}
/>

// [PASS] CORRECT - Use editable prop
<textfield
  value={name}
  editable={false}  // Same as disabled={true}
/>
```

### Single-line vs Multi-line

Use different elements, NOT `multiline` prop:

```typescript
// [FAIL] WRONG - multiline prop not supported
<textfield
  value={description}
  multiline={true}
/>

// [PASS] CORRECT - Use <textview> for multi-line input
<textview
  value={description}
  onChange={(e: EditTextEvent) => setDescription(e.text)}
/>

// [PASS] CORRECT - Use <textfield> for single-line input
<textfield
  value={name}
  onChange={(e: EditTextEvent) => setName(e.text)}
/>
```

## 5. Component Patterns

### Use StatefulComponent

Use `StatefulComponent` as the base class, NOT `NavigationPageStatefulComponent`:

```typescript
// [FAIL] WRONG - NavigationPageStatefulComponent not standard
export class MyComponent extends NavigationPageStatefulComponent<MyProps, MyState> {
  // ...
}

// [PASS] CORRECT - Use StatefulComponent
export class MyComponent extends StatefulComponent<MyProps, MyState> {
  constructor(props: MyProps) {
    super(props);
    this.state = {
      // initial state
    };
  }

  render() {
    return (
      <view>
        {/* component content */}
      </view>
    );
  }
}
```

### Ref Patterns with IRenderedElementHolder

Use `IRenderedElementHolder` for element refs:

```typescript
// [PASS] CORRECT - IRenderedElementHolder for refs
export class MyComponent extends StatefulComponent<MyProps, MyState> {
  private inputRef: IRenderedElementHolder | null = null;

  private focusInput = () => {
    if (this.inputRef) {
      // Use ref to interact with element
      this.inputRef.focus();
    }
  };

  render() {
    return (
      <view>
        <textfield
          ref={(ref) => this.inputRef = ref}
          value={this.state.inputValue}
          onChange={(e: EditTextEvent) => this.setState({ inputValue: e.text })}
        />
        <button onPress={this.focusInput}>
          <label>Focus Input</label>
        </button>
      </view>
    );
  }
}
```

## Common Pitfalls Summary

1. **Never use inline styles** - Always create `new Style<View>()` or `new Style<Label>()`
2. **Never use `flex`** - Use `flexGrow` and `flexShrink` explicitly
3. **Never use shorthand padding/margin** - Use individual properties (paddingTop, marginLeft, etc.)
4. **Never use `fontSize`/`fontWeight` on Label** - Use `font: systemFont(16)` or `font: systemBoldFont(16)`
5. **Never use `onChange` with `.value`** - Use `EditTextEvent.text` property
6. **Never use `disabled`** - Use `editable={false}`
7. **Never use `multiline` prop** - Use `<textview>` element instead
8. **Never use capitalized element names** - Use lowercase (`<scroll>`, `<view>`, `<label>`)
9. **Never use individual border widths** - Only uniform `borderWidth` is supported

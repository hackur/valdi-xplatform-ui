# Valdi Framework Patterns Guide

This guide documents essential patterns and best practices for developing with the Valdi framework in the Valdi AI UI project.

---

## Table of Contents

1. [Style Type Parameters](#style-type-parameters)
2. [Font Properties](#font-properties)
3. [Layout Properties](#layout-properties)
4. [Element Names](#element-names)
5. [TextField/TextInput Patterns](#textfieldtextinput-patterns)
6. [Image Components](#image-components)
7. [Common Patterns](#common-patterns)
8. [Common Mistakes and Solutions](#common-mistakes-and-solutions)

---

## Style Type Parameters

### Rule: Always Use Generic Type Parameters

All `Style` objects must be created with a generic type parameter specifying the element type. This ensures type safety and proper IDE support.

### Correct Usage

```tsx
import { Style } from 'valdi_core/src/Style';
import type { View, Label, Image } from 'valdi_tsx/src/NativeTemplateElements';

// For view containers
const containerStyle = new Style<View>({
  width: '100%',
  paddingLeft: 16,
  flexDirection: 'row',
});

// For text/label elements
const textStyle = new Style<Label>({
  color: '#000000',
  font: systemFont(16),
});

// For image elements
const imageStyle = new Style<Image>({
  width: 40,
  height: 40,
  borderRadius: 20,
});
```

### Common Style Type Parameters

| Type | Usage | Example |
|------|-------|---------|
| `View` | Container elements, card, button containers | Layout, backgrounds, positioning |
| `Label` | Text and label elements | Typography, text color, font styling |
| `Image` | Image elements | Image sizing, border radius, shadows |

### Incorrect Usage (AVOID)

```tsx
// ❌ Missing type parameter
const style = new Style({
  width: '100%',
});

// ❌ Using Style without type
const unstyledView: Style = new Style({
  padding: 16,
});
```

---

## Font Properties

### Rule: Use systemFont() for Dynamic Font Sizes

Use the `systemFont()` and `systemBoldFont()` functions from `valdi_core/src/SystemFont` instead of direct font size numbers.

### Correct Usage

```tsx
import { Style } from 'valdi_core/src/Style';
import { systemFont, systemBoldFont } from 'valdi_core/src/SystemFont';
import type { Label } from 'valdi_tsx/src/NativeTemplateElements';

// Using systemFont
const bodyStyle = new Style<Label>({
  font: systemFont(16),
  color: '#333333',
});

// Using systemBoldFont for emphasis
const headingStyle = new Style<Label>({
  font: systemBoldFont(20),
  color: '#000000',
});

// In component methods
private getLabelStyle(fontSize: number, textColor: string): Style<Label> {
  return new Style<Label>({
    font: systemBoldFont(fontSize),
    color: textColor,
  });
}
```

### Using Theme Font Styles

For consistency, use predefined font styles from the theme:

```tsx
import { Fonts } from 'common/src/theme';

// Using complete font styles
const headingStyle = new Style<Label>({
  ...Fonts.h2,
  color: Colors.textPrimary,
});

const bodyStyle = new Style<Label>({
  ...Fonts.body,
  color: Colors.textPrimary,
});

const captionStyle = new Style<Label>({
  ...Fonts.caption,
  color: Colors.textTertiary,
});
```

### Available Font Styles in Theme

```
// Headings
Fonts.h1, h2, h3, h4, h5, h6

// Body text
Fonts.body, bodyLarge, bodySmall, bodyMedium, bodySemibold, bodyBold

// Captions
Fonts.caption, captionMedium, captionBold, overline

// Buttons
Fonts.button, buttonSmall, buttonLarge

// Code
Fonts.code, codeBlock

// Chat specific
Fonts.chatMessage, chatTimestamp, chatSenderName
```

### Incorrect Usage (AVOID)

```tsx
// ❌ Direct fontSize property
const style = new Style<Label>({
  fontSize: 16,  // Wrong property name in Valdi
  color: '#000000',
});

// ❌ Forgetting systemFont
const style = new Style<Label>({
  font: '16px',  // Wrong format
});

// ❌ Missing font property entirely
const textStyle = new Style<Label>({
  color: Colors.textPrimary,
  // Font not specified - uses default
});
```

---

## Layout Properties

### Rule: Use Individual Padding/Margin Properties

Always use individual properties (`paddingTop`, `paddingLeft`, etc.) instead of shorthand notation. Valdi does not support shorthand CSS-like padding syntax.

### Correct Usage - Individual Properties

```tsx
import { Style } from 'valdi_core/src/Style';
import type { View } from 'valdi_tsx/src/NativeTemplateElements';
import { Spacing } from 'common/src/theme';

// Individual padding properties
const containerStyle = new Style<View>({
  paddingTop: Spacing.lg,    // 24px
  paddingRight: Spacing.base, // 16px
  paddingBottom: Spacing.lg,   // 24px
  paddingLeft: Spacing.base,  // 16px
});

// Using theme spacing constants
const cardStyle = new Style<View>({
  paddingLeft: Spacing.base,
  paddingRight: Spacing.base,
  paddingTop: Spacing.sm,
  paddingBottom: Spacing.sm,
});

// Individual margin properties
const messageStyle = new Style<View>({
  marginTop: Spacing.xs,
  marginLeft: 40,
  marginBottom: 0,
  marginRight: 0,
});
```

### Rule: Use flexGrow/flexShrink Instead of flex

Use individual `flexGrow` and `flexShrink` properties instead of the `flex` shorthand.

### Correct Usage - Flex Properties

```tsx
// ✓ Correct: Use flexGrow and flexShrink
const flexContainerStyle = new Style<View>({
  flexDirection: 'row',
  flexGrow: 1,      // Take available space
  flexShrink: 0,    // Don't shrink below content
  alignItems: 'center',
});

// ✓ Correct: For different flexibility needs
const expandableStyle = new Style<View>({
  flexGrow: 1,      // Expand to fill
  flexShrink: 1,    // Can shrink if needed
});

const fixedStyle = new Style<View>({
  flexGrow: 0,      // Don't expand
  flexShrink: 0,    // Don't shrink
  width: 100,
});
```

### Spacing Constants from Theme

Use predefined spacing constants for consistency:

```tsx
import { Spacing } from 'common/src/theme';

// Available spacing values
Spacing.xxs   // 4px
Spacing.xs    // 8px
Spacing.sm    // 12px
Spacing.base  // 16px
Spacing.md    // 20px
Spacing.lg    // 24px
Spacing.xl    // 32px
Spacing.xxl   // 40px
```

### Incorrect Usage (AVOID)

```tsx
// ❌ Shorthand padding notation
const style = new Style<View>({
  padding: '16px 24px',  // Wrong syntax
});

// ❌ CSS-like shorthand
const style = new Style<View>({
  margin: '10px 20px 10px 20px',  // Not supported
});

// ❌ flex shorthand
const style = new Style<View>({
  flex: 1,  // Use flexGrow instead
});

// ❌ Missing units for numeric properties
const style = new Style<View>({
  marginTop: 10,  // Should use Spacing constant
});
```

---

## Element Names

### Rule: Always Use Lowercase Element Names

Valdi uses lowercase HTML-like element names. Never use PascalCase component names for native elements.

### Correct Usage

```tsx
// Container elements
<view style={containerStyle}>
  {children}
</view>

// Text display
<label value="Hello World" style={textStyle} />

// Input elements
<textfield
  value={inputValue}
  placeholder="Enter text"
  onChange={handleChange}
  style={inputStyle}
/>

// Multiline text input
<textview
  value={multilineText}
  placeholder="Enter description"
  onChange={handleChange}
  numberOfLines={4}
  style={textareaStyle}
/>

// Image elements
<image
  source={imageUrl}
  style={imageStyle}
/>

// Scroll container
<scroll style={scrollStyle}>
  {children}
</scroll>
```

### Complete Element Reference

| Element | Usage | Notes |
|---------|-------|-------|
| `<view>` | Container, layout | Use for any grouping/layout |
| `<label>` | Text display | Use property `value` for text |
| `<textfield>` | Single-line input | Use `onChange` with `EditTextEvent` |
| `<textview>` | Multi-line text input | For longer text content |
| `<image>` | Image display | Use property `source` for URL |
| `<scroll>` | Scrollable container | For scrollable content |
| `<flatlist>` | List rendering | For high-performance lists |

### Incorrect Usage (AVOID)

```tsx
// ❌ PascalCase element names
<View style={containerStyle}>
  {children}
</View>

// ❌ Wrong element name
<Text value="Hello" style={textStyle} />  // Use <label>

// ❌ Using HTML elements
<div style={containerStyle}></div>  // Use <view>

// ❌ Mixing conventions
<View>
  <Text>Hello</Text>
</View>
```

---

## TextField/TextInput Patterns

### Rule: Use onChange with EditTextEvent.text

TextField components use the `onChange` callback with an `EditTextEvent` object. Extract the text using `event.text`.

### Correct Usage

```tsx
import type { EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';

// Single-line text input
private readonly handleChange = (event: EditTextEvent): void => {
  const { onChangeText } = this.viewModel;
  if (onChangeText) {
    onChangeText(event.text);  // ✓ Correct: Use event.text
  }
};

// In render
onRender() {
  const { value, placeholder } = this.viewModel;

  return (
    <textfield
      value={value}
      placeholder={placeholder}
      onChange={this.handleChange}  // onChange, not onChangeText
      style={inputStyle}
    />
  );
}

// Multi-line input using textview
private readonly handleDescriptionChange = (event: EditTextEvent): void => {
  this.setState({ description: event.text });
};

onRender() {
  return (
    <textview
      value={this.state.description}
      placeholder="Enter description"
      onChange={this.handleDescriptionChange}
      numberOfLines={4}
      style={multilineStyle}
    />
  );
}
```

### Rule: Use editable={false} Instead of disabled

For disabled state, use the `editable` property set to `false`.

### Correct Usage - Disabled State

```tsx
// ✓ Correct: Use editable={false}
<textfield
  value={value}
  placeholder={placeholder}
  onChange={handleChange}
  editable={false}  // This disables the field
  style={disabledInputStyle}
/>

// For styling disabled state
private getInputStyle(disabled: boolean) {
  return new Style<View>({
    width: '100%',
    backgroundColor: disabled ? Colors.gray100 : Colors.surface,
    opacity: disabled ? 0.5 : 1,
  });
}

// In render
<textfield
  value={value}
  onChange={handleChange}
  editable={!disabled}  // Disable if disabled is true
  style={this.getInputStyle(disabled)}
/>
```

### Complete TextInput Component Pattern

```tsx
import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, EditTextEvent } from 'valdi_tsx/src/NativeTemplateElements';
import { Colors, Spacing, BorderRadius } from 'common/src';

export interface TextInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  style?: Style<View> | Record<string, unknown>;
}

interface TextInputState {
  isFocused: boolean;
}

export class TextInput extends StatefulComponent<TextInputProps, TextInputState> {
  override state: TextInputState = {
    isFocused: false,
  };

  private readonly handleChange = (event: EditTextEvent): void => {
    const { onChangeText } = this.viewModel;
    if (onChangeText) {
      onChangeText(event.text);
    }
  };

  private readonly handleFocus = (): void => {
    this.setState({ isFocused: true });
  };

  private readonly handleBlur = (): void => {
    this.setState({ isFocused: false });
  };

  override onRender() {
    const { value, placeholder, disabled, style: customStyle } = this.viewModel;
    const { isFocused } = this.state;

    const borderColor = isFocused ? Colors.primary : Colors.border;

    return (
      <view
        style={new Style<View>({
          borderWidth: 1,
          borderColor,
          borderRadius: BorderRadius.base,
          paddingLeft: Spacing.base,
          paddingRight: Spacing.base,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.sm,
          backgroundColor: disabled ? Colors.gray100 : Colors.surface,
          ...customStyle,
        })}
      >
        <textfield
          value={value}
          placeholder={placeholder}
          onChange={this.handleChange}
          editable={!disabled}  // Use editable instead of disabled
          style={new Style<View>({
            width: '100%',
            backgroundColor: 'transparent',
            opacity: disabled ? 0.5 : 1,
          })}
        />
      </view>
    );
  }
}
```

### Incorrect Usage (AVOID)

```tsx
// ❌ Using onChangeText directly
<textfield
  value={value}
  onChangeText={handleChange}  // Wrong callback name
/>

// ❌ Using event.value instead of event.text
private handleChange = (event: EditTextEvent): void => {
  console.log(event.value);  // Wrong property
};

// ❌ Using disabled property
<textfield
  value={value}
  disabled={true}  // Use editable={false}
/>

// ❌ Not type-casting EditTextEvent
private handleChange = (event: any): void => {
  this.setState({ text: event.text });  // Should type event properly
};
```

---

## Image Components

### Rule: Use source Property for Image URLs

Image elements use the `source` property (not `src`) to specify image URLs.

### Correct Usage

```tsx
import type { Image } from 'valdi_tsx/src/NativeTemplateElements';

// Using image URL
<image
  source="https://example.com/avatar.jpg"
  style={imageStyle}
/>

// From props
const { imageUrl } = this.viewModel;
<image
  source={imageUrl}
  style={new Style<Image>({
    width: 40,
    height: 40,
    borderRadius: 20,
  })}
/>

// With styling
<image
  source={avatarUrl}
  style={new Style<Image>({
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray200,
  })}
/>
```

### Common Image Styling Patterns

```tsx
// Avatar circle
const avatarStyle = new Style<Image>({
  width: 40,
  height: 40,
  borderRadius: 20,  // Half of width for perfect circle
});

// Rounded rectangle
const thumbnailStyle = new Style<Image>({
  width: 120,
  height: 80,
  borderRadius: 8,
});

// Responsive sizing
const responsiveImageStyle = new Style<Image>({
  width: '100%',
  height: 'auto',
  borderRadius: BorderRadius.base,
});

// Image with shadow
const elevatedImageStyle = new Style<Image>({
  width: 48,
  height: 48,
  borderRadius: 24,
  ...Shadows.sm,  // Add shadow
});
```

### Incorrect Usage (AVOID)

```tsx
// ❌ Using src instead of source
<image src={imageUrl} />

// ❌ Using img element
<img src={imageUrl} />

// ❌ Forgetting aspect ratio management
<image
  source={imageUrl}
  style={new Style<Image>({
    width: '100%',
    // Missing height causes layout issues
  })}
/>

// ❌ Using wrong CSS properties
<image
  source={imageUrl}
  style={new Style<Image>({
    backgroundImage: `url(${imageUrl})`,  // Not supported
  })}
/>
```

---

## Common Patterns

### Button Component Pattern

```tsx
export interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onTap?: () => void;
  style?: Style<View> | Record<string, unknown>;
}

export class Button extends Component<ButtonProps> {
  private readonly handleTap = (): void => {
    const { disabled, loading, onTap } = this.viewModel;
    if (!disabled && !loading && onTap) {
      onTap();
    }
  };

  override onRender() {
    const { title, loading, style: customStyle } = this.viewModel;

    return (
      <view
        style={this.getContainerStyle(customStyle)}
        onTap={this.handleTap}
      >
        {loading ? (
          <label value="..." style={this.getLabelStyle()} />
        ) : (
          <label value={title} style={this.getLabelStyle()} />
        )}
      </view>
    );
  }
}
```

### Card Component Pattern

```tsx
export interface CardProps {
  children?: unknown;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: number;
  backgroundColor?: string;
  bordered?: boolean;
  onTap?: () => void;
  style?: Style<View> | Record<string, unknown>;
}

export class Card extends Component<CardProps> {
  static defaultProps: Partial<CardProps> = {
    elevation: 'sm',
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    bordered: false,
  };

  override onRender() {
    const {
      children,
      padding,
      backgroundColor,
      bordered,
      onTap,
      style: customStyle,
    } = this.viewModel;

    return (
      <view
        style={new Style<View>({
          width: '100%',
          padding: padding ?? Spacing.base,
          backgroundColor: backgroundColor ?? Colors.surface,
          borderWidth: bordered ? 1 : 0,
          borderColor: Colors.border,
          borderRadius: BorderRadius.md,
          ...customStyle,
        })}
        onTap={onTap ? () => onTap?.() : undefined}
      >
        {children}
      </view>
    );
  }
}
```

### Avatar Component Pattern

```tsx
export interface AvatarProps {
  type?: 'user' | 'ai' | 'system';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  initials?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  elevated?: boolean;
}

export class Avatar extends Component<AvatarProps> {
  private getSize(): number {
    const { size } = this.viewModel;
    return { small: 32, medium: 40, large: 48, xlarge: 64 }[size ?? 'medium'];
  }

  override onRender() {
    const { imageUrl } = this.viewModel;
    const size = this.getSize();

    return (
      <view
        style={new Style<View>({
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: this.getBackgroundColor(),
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        {imageUrl ? (
          <image
            source={imageUrl}
            style={new Style<Image>({
              width: size,
              height: size,
              borderRadius: size / 2,
            })}
          />
        ) : (
          <label
            value={this.getInitials()}
            style={new Style<Label>({
              font: systemBoldFont(this.getFontSize()),
              color: this.getTextColor(),
            })}
          />
        )}
      </view>
    );
  }
}
```

### List Item Pattern

```tsx
export interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  avatar?: AvatarProps;
  onTap?: () => void;
  style?: Style<View> | Record<string, unknown>;
}

export class ListItem extends Component<ListItemProps> {
  override onRender() {
    const { title, subtitle, avatar, onTap, style: customStyle } = this.viewModel;

    return (
      <view
        style={new Style<View>({
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: Spacing.base,
          paddingRight: Spacing.base,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          ...customStyle,
        })}
        onTap={onTap ? () => onTap?.() : undefined}
      >
        {/* Avatar */}
        {avatar && <Avatar {...avatar} size="medium" />}

        {/* Text Content */}
        <view
          style={new Style<View>({
            flexGrow: 1,
            flexShrink: 1,
            marginLeft: avatar ? Spacing.base : 0,
          })}
        >
          <label
            value={title}
            style={new Style<Label>({
              ...Fonts.body,
              color: Colors.textPrimary,
            })}
          />
          {subtitle && (
            <label
              value={subtitle}
              style={new Style<Label>({
                ...Fonts.caption,
                color: Colors.textTertiary,
                marginTop: Spacing.xs,
              })}
            />
          )}
        </view>
      </view>
    );
  }
}
```

---

## Common Mistakes and Solutions

### Mistake 1: Missing Style Type Parameter

**Problem**: Styles without type parameters cause type errors and poor IDE support.

```tsx
// ❌ Wrong
const style = new Style({
  width: 100,
  padding: 16,
});
```

**Solution**: Always specify the element type.

```tsx
// ✓ Correct
const style = new Style<View>({
  width: 100,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 16,
  paddingBottom: 16,
});
```

---

### Mistake 2: Using fontSize Instead of font

**Problem**: Valdi doesn't recognize `fontSize` property.

```tsx
// ❌ Wrong
const textStyle = new Style<Label>({
  fontSize: 16,  // Property doesn't exist in Valdi
  color: '#000000',
});
```

**Solution**: Use `font` property with `systemFont()`.

```tsx
// ✓ Correct
const textStyle = new Style<Label>({
  font: systemFont(16),
  color: '#000000',
});
```

---

### Mistake 3: Shorthand Padding/Margin

**Problem**: CSS-like shorthand doesn't work in Valdi.

```tsx
// ❌ Wrong
const containerStyle = new Style<View>({
  padding: '16px',
  margin: '8px 16px',
});
```

**Solution**: Use individual properties.

```tsx
// ✓ Correct
const containerStyle = new Style<View>({
  paddingLeft: Spacing.base,
  paddingRight: Spacing.base,
  paddingTop: Spacing.base,
  paddingBottom: Spacing.base,
  marginTop: Spacing.xs,
  marginRight: Spacing.base,
  marginBottom: Spacing.xs,
  marginLeft: Spacing.base,
});
```

---

### Mistake 4: Using PascalCase for Element Names

**Problem**: Valdi uses lowercase element names.

```tsx
// ❌ Wrong
<View style={containerStyle}>
  <Text>Hello</Text>
  <TextInput value={text} onChange={handleChange} />
</View>
```

**Solution**: Use lowercase Valdi element names.

```tsx
// ✓ Correct
<view style={containerStyle}>
  <label value="Hello" />
  <textfield value={text} onChange={handleChange} />
</view>
```

---

### Mistake 5: Using src Instead of source for Images

**Problem**: Image elements use `source` property, not `src`.

```tsx
// ❌ Wrong
<image src={imageUrl} style={imageStyle} />
```

**Solution**: Use `source` property.

```tsx
// ✓ Correct
<image source={imageUrl} style={imageStyle} />
```

---

### Mistake 6: Using event.value in TextField onChange

**Problem**: `EditTextEvent` has `text` property, not `value`.

```tsx
// ❌ Wrong
private handleChange = (event: EditTextEvent): void => {
  console.log(event.value);  // Undefined
};
```

**Solution**: Use `event.text` property.

```tsx
// ✓ Correct
private handleChange = (event: EditTextEvent): void => {
  console.log(event.text);  // Correct
  this.viewModel.onChangeText?.(event.text);
};
```

---

### Mistake 7: Using disabled Instead of editable={false}

**Problem**: TextField doesn't have `disabled` property.

```tsx
// ❌ Wrong
<textfield
  value={value}
  disabled={true}  // Property doesn't exist
/>
```

**Solution**: Use `editable={false}` for disabled state.

```tsx
// ✓ Correct
<textfield
  value={value}
  editable={false}  // Disables the field
  style={disabledStyle}
/>
```

---

### Mistake 8: Using flex Shorthand

**Problem**: Valdi doesn't support `flex` shorthand.

```tsx
// ❌ Wrong
const style = new Style<View>({
  flex: 1,  // Property doesn't exist
  flexDirection: 'row',
});
```

**Solution**: Use `flexGrow` and `flexShrink` individually.

```tsx
// ✓ Correct
const style = new Style<View>({
  flexGrow: 1,
  flexShrink: 0,
  flexDirection: 'row',
});
```

---

### Mistake 9: Forgetting Style Type in Variable Declarations

**Problem**: Not specifying type in Style variables.

```tsx
// ❌ Wrong
const styles = {
  container: new Style({  // Missing type parameter
    padding: 16,
  }),
};
```

**Solution**: Always type the Style objects.

```tsx
// ✓ Correct
const styles = {
  container: new Style<View>({
    paddingLeft: Spacing.base,
    paddingRight: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  }),

  title: new Style<Label>({
    ...Fonts.h2,
    color: Colors.textPrimary,
  }),
};
```

---

### Mistake 10: Not Using Theme Constants

**Problem**: Hard-coding values instead of using theme constants.

```tsx
// ❌ Wrong
const style = new Style<View>({
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 12,
  paddingBottom: 12,
  backgroundColor: '#F5F5F5',
  borderRadius: 8,
});
```

**Solution**: Use theme constants for consistency.

```tsx
// ✓ Correct
import { Colors, Spacing, BorderRadius } from 'common/src/theme';

const style = new Style<View>({
  paddingLeft: Spacing.base,
  paddingRight: Spacing.base,
  paddingTop: Spacing.sm,
  paddingBottom: Spacing.sm,
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.base,
});
```

---

## Quick Reference Checklist

When creating Valdi components, verify:

- [ ] All `Style` objects have type parameters: `Style<View>`, `Style<Label>`, etc.
- [ ] Font sizes use `systemFont(size)` not `fontSize` property
- [ ] Padding/margin use individual properties: `paddingTop`, `marginLeft`, etc.
- [ ] Element names are lowercase: `<view>`, `<label>`, `<textfield>`
- [ ] Image `source` property is used, not `src`
- [ ] TextFields use `onChange` with `event.text`, not `onChangeText`
- [ ] Disabled state uses `editable={false}`, not `disabled` property
- [ ] Layout uses `flexGrow`/`flexShrink`, not `flex` shorthand
- [ ] Theme constants are used: `Colors`, `Spacing`, `Fonts`, `BorderRadius`
- [ ] Component styles are created with proper type safety

---

## Resources

- **Style System**: `/modules/common/src/theme/`
- **Component Examples**: `/modules/common/src/components/`
- **Chat Components**: `/modules/chat_ui/src/`
- **Settings Components**: `/modules/settings/src/components/`

---

*Last updated: 2025-11-30*
*Valdi Framework Version: Latest*

# GOLDEN RULES

- The year is 2025 but when you search use the versions of things that match the project's dependencies
- Never ever use emoji or icons unless you are specifically instructed to.
- Use a professional voice and make sure to consider this is a Snapchat Valdi UI project do online research to make sure you're using typescript correctly.
- when you're looking for files or occurances of text in code make sure to filter things out with grep but use things like "ag" commands or include before/after 3 lines context for occurances and then have more broad text and case insensivtive so we can see all occurances and get full picture.

# CRITICAL: Style Type Pattern

ALWAYS use `Style<View>` or `Style<Label>` type parameters! The Valdi compiler REQUIRES these.

```typescript
// [FAIL] WRONG - Missing type parameter (Bazel build will FAIL)
new Style({...})

// [PASS] CORRECT - View styles for <view> elements
new Style<View>({
  flexDirection: 'row',
  backgroundColor: Colors.surface,
})

// [PASS] CORRECT - Label styles for <label> elements (with font property)
new Style<Label>({
  font: systemBoldFont(16),
  color: Colors.textPrimary,
})
```

**When to use which:**
- `Style<View>` - Containers, layouts, wrappers (most common)
- `Style<Label>` - Text styles with `font` property

**Why required:** The type parameter `<T>` tells the Valdi compiler which native element type the style applies to. Without it, the Bazel/Valdi build fails.

Run `./scripts/fix-style-types.sh` to add missing type parameters.

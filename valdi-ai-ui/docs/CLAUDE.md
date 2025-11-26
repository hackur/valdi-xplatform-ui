# GOLDEN RULES

- The year is 2025 but when you search use the versions of things that match the project's dependencies
- Never ever use emoji or icons unless you are specifically instructed to.
- Use a professional voice and make sure to consider this is a Snapchat Valdi UI project do online research to make sure you're using typescript correctly.
- when you're looking for files or occurances of text in code make sure to filter things out with grep but use things like "ag" commands or include before/after 3 lines context for occurances and then have more broad text and case insensivtive so we can see all occurances and get full picture.

# CRITICAL: Style Type Pattern

NEVER use generic type parameters with Style. TypeScript infers the type automatically.

```typescript
// [FAIL] WRONG - Do not use type parameters
new Style<View>({...})
new Style<Label>({...})
new Style<{padding: number}>({...})
: Style<View>

// [PASS] CORRECT - Let TypeScript infer
new Style({...})
: Style
```

Run `./scripts/fix-style-types.sh` to fix existing violations.

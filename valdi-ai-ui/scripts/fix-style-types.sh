#!/bin/bash
# Fix Style Type Errors
# Replaces Style<View>, Style<Label>, Style<{...}> with just Style throughout codebase
# This is Priority 1 fix for ~200 style errors

set -e
cd "$(dirname "$0")/.."

echo "[STYLE-FIX] Starting Style type simplification..."
echo "[INFO] This script replaces Style<T> with just Style (TypeScript infers the type)"
echo ""

# Count before
BEFORE_COUNT=$(grep -rn "new Style<" --include="*.tsx" --include="*.ts" modules/ 2>/dev/null | wc -l | tr -d ' ')
echo "[INFO] Found $BEFORE_COUNT instances of 'new Style<T>' to fix"

# Fix 1: Replace new Style<View>( with new Style(
echo "[FIX] Replacing Style<View> with Style..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "new Style<View>" "$file" 2>/dev/null; then
    sed -i '' 's/new Style<View>/new Style/g' "$file"
    echo "  Fixed: $file"
  fi
done

# Fix 2: Replace new Style<Label>( with new Style(
echo "[FIX] Replacing Style<Label> with Style..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "new Style<Label>" "$file" 2>/dev/null; then
    sed -i '' 's/new Style<Label>/new Style/g' "$file"
    echo "  Fixed: $file"
  fi
done

# Fix 3: Replace new Style<Image>( with new Style(
echo "[FIX] Replacing Style<Image> with Style..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "new Style<Image>" "$file" 2>/dev/null; then
    sed -i '' 's/new Style<Image>/new Style/g' "$file"
    echo "  Fixed: $file"
  fi
done

# Fix 4: Replace new Style<ScrollView>( with new Style(
echo "[FIX] Replacing Style<ScrollView> with Style..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "new Style<ScrollView>" "$file" 2>/dev/null; then
    sed -i '' 's/new Style<ScrollView>/new Style/g' "$file"
    echo "  Fixed: $file"
  fi
done

# Fix 5: Replace new Style<TextInput>( with new Style(
echo "[FIX] Replacing Style<TextInput> with Style..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "new Style<TextInput>" "$file" 2>/dev/null; then
    sed -i '' 's/new Style<TextInput>/new Style/g' "$file"
    echo "  Fixed: $file"
  fi
done

# Fix 6: Generic pattern - Replace any remaining Style<SomeType> patterns
echo "[FIX] Replacing any remaining Style<T> patterns..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  # Match Style<AnythingHere> and replace with just Style
  if grep -q "new Style<[A-Za-z]*>" "$file" 2>/dev/null; then
    sed -i '' 's/new Style<[A-Za-z]*>/new Style/g' "$file"
    echo "  Fixed: $file"
  fi
done

# Fix 7: Handle Style<{...}> inline object type patterns (rare but possible)
echo "[FIX] Replacing Style<{...}> inline type patterns..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  # This pattern handles Style<{ ... }> with inline object types
  if grep -q "Style<{" "$file" 2>/dev/null; then
    # Use perl for multi-line matching with nested braces
    perl -i -p0e 's/Style<\{[^}]*\}>/Style/gs' "$file"
    echo "  Fixed inline type: $file"
  fi
done

# Also fix return type annotations: Style<View> -> Style
echo "[FIX] Fixing return type annotations..."
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q ": Style<" "$file" 2>/dev/null; then
    sed -i '' 's/: Style<[A-Za-z]*>/: Style/g' "$file"
    echo "  Fixed return type: $file"
  fi
done

# Fix 8: Clean up unused View/Label imports that were only used for Style<T>
# NOTE: This is a best-effort cleanup. Some imports may need manual review
# if View/Label are used in type annotations (use `import type` for those).
echo "[FIX] Cleaning up unused View/Label imports..."
echo "[INFO] Check for 'Cannot find name View/Label' errors after running."
echo "[INFO] If a type is needed, add: import type { View } from 'valdi_tsx/src/NativeTemplateElements'"

# Count after
AFTER_COUNT=$(grep -rn "new Style<" --include="*.tsx" --include="*.ts" modules/ 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "[DONE] Style type simplification complete!"
echo "[RESULT] Before: $BEFORE_COUNT instances"
echo "[RESULT] After: $AFTER_COUNT instances"
echo "[RESULT] Fixed: $((BEFORE_COUNT - AFTER_COUNT)) instances"
echo ""
echo "[NEXT] Run 'npm run type-check' to verify no type errors introduced"

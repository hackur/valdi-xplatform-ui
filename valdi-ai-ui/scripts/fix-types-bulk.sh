#!/bin/bash
# Bulk TypeScript error fixes

cd "$(dirname "$0")/.."

echo "🔧 Applying bulk TypeScript fixes..."

# Fix 1: Replace new Style({...}) with plain objects
# This is complex and needs careful handling, skipping for safety

# Fix 2: Add type annotations to common callback parameters
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  # Add string type to onChangeText callbacks
  sed -i '' 's/onChangeText={(\([a-zA-Z_][a-zA-Z0-9_]*\))/onChangeText={(\1: string)/g' "$file"

  # Add Error type to error callbacks
  sed -i '' 's/onError={(\([a-zA-Z_][a-zA-Z0-9_]*\))/onError={(\1: Error)/g' "$file"
  sed -i '' 's/fallback={(\([a-zA-Z_][a-zA-Z0-9_]*\))/fallback={(\1: Error)/g' "$file"
done

# Fix 3: Remove unused Style imports
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
  # Check if Style is imported but not used (except in import line)
  if grep -q "import.*Style.*from" "$file"; then
    if ! grep -v "import.*Style" "$file" | grep -q "Style\|new Style"; then
      # Remove the Style import
      sed -i '' '/import { Style }/d' "$file"
      sed -i '' 's/, Style//g' "$file"
      sed -i '' 's/Style, //g' "$file"
    fi
  fi
done

# Fix 4: Add override keywords where needed
# This requires TypeScript compiler feedback, skipping automated fix

echo "✅ Bulk fixes applied!"
echo "📊 Running type check..."
npx tsc --noEmit 2>&1 | grep -E "^modules/" | wc -l

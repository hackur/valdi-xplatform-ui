#!/bin/bash
# Fix Style Type Errors - CORRECT VERSION
#
# IMPORTANT: Valdi REQUIRES Style<View> and Style<Label> type parameters!
# The type parameter tells the Valdi compiler which element type the style applies to.
#
# This script:
# 1. Finds `new Style({...})` calls WITHOUT type parameters
# 2. Adds `Style<View>` type parameter (the most common case)
# 3. Reports files that may need manual review for Style<Label>
#
# Style<Label> should be used for:
# - Styles with `font` property (for <label> elements)
# - errorIcon, errorTitle, errorMessage, helpText, etc.
#
# Style<View> should be used for:
# - Containers, layouts, wrappers (for <view> elements)
# - container, content, overlay, dialog, etc.

set -e
cd "$(dirname "$0")/.."

echo "=============================================="
echo "  Valdi Style Type Parameter Fixer"
echo "=============================================="
echo ""
echo "IMPORTANT: Valdi REQUIRES Style<View> and Style<Label> type parameters!"
echo ""
echo "Patterns:"
echo "  - Style<View>  -> for <view> elements (containers, layouts)"
echo "  - Style<Label> -> for <label> elements (text with font property)"
echo ""

# Count instances without type parameter
NO_TYPE_COUNT=$(grep -rn "new Style({" --include="*.tsx" --include="*.ts" modules/ 2>/dev/null | wc -l | tr -d ' ')
echo "[INFO] Found $NO_TYPE_COUNT instances of 'new Style({' without type parameter"

if [ "$NO_TYPE_COUNT" -eq 0 ]; then
    echo "[SUCCESS] All Style calls already have type parameters!"
    exit 0
fi

echo ""
echo "[STEP 1] Adding Style<View> to most common cases..."

# Find and fix files with new Style({ that don't have a type parameter
find modules -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "new Style({" "$file" 2>/dev/null; then
        # Check if file already has proper type parameters
        if grep -q "new Style<View>({" "$file" 2>/dev/null || grep -q "new Style<Label>({" "$file" 2>/dev/null; then
            echo "  [SKIP] $file (already has typed styles)"
        else
            # Replace new Style({ with new Style<View>({
            sed -i '' 's/new Style({/new Style<View>({/g' "$file"
            echo "  [FIXED] $file"
        fi
    fi
done

echo ""
echo "[STEP 2] Identifying styles that should be Style<Label>..."
echo "         (styles with 'font:' property typically need Style<Label>)"
echo ""

# Find files that might need Style<Label> instead of Style<View>
echo "Files to manually review for Style<Label>:"
grep -rln "font:" --include="*.tsx" --include="*.ts" modules/common/src/components/ 2>/dev/null | while read file; do
    echo "  - $file"
done

echo ""
echo "[STEP 3] Checking for common patterns that need Style<Label>..."

# List of common label-related style names
LABEL_PATTERNS="errorIcon|errorTitle|errorMessage|helpText|detailsTitle|detailsText|stackTrace|title|message|text|label|buttonText"

echo ""
echo "Styles that likely need Style<Label> (have font property and text-related names):"
grep -rn "const styles" --include="*.tsx" modules/common/src/components/ -A 200 2>/dev/null | \
    grep -E "($LABEL_PATTERNS):" | head -20

echo ""
echo "=============================================="
echo "  Manual Review Required"
echo "=============================================="
echo ""
echo "After running this script, manually verify:"
echo ""
echo "1. Check for styles with 'font:' property - these need Style<Label>"
echo "2. Update const styles objects:"
echo ""
echo "   WRONG:  errorTitle: new Style<View>({ font: systemBoldFont(24), ... })"
echo "   RIGHT:  errorTitle: new Style<Label>({ font: systemBoldFont(24), ... })"
echo ""
echo "3. Ensure View and Label are imported:"
echo "   import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';"
echo ""
echo "4. Run 'npm run type-check' to verify fixes"
echo ""

# Final count
REMAINING=$(grep -rn "new Style({" --include="*.tsx" --include="*.ts" modules/ 2>/dev/null | wc -l | tr -d ' ')
FIXED=$((NO_TYPE_COUNT - REMAINING))

echo "[RESULT] Fixed: $FIXED instances"
echo "[RESULT] Remaining (need type): $REMAINING instances"
echo ""

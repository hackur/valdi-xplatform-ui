#!/bin/bash
# Verify all imports use Valdi format (no @ aliases)
set -e

MODULES_DIR="/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/modules"

echo "==> Checking for incorrect import patterns..."
echo ""

# Check for @ imports
BAD_IMPORTS=$(grep -rn "from ['\"]@\(common\|chat_core\|chat_ui\|agent_manager\|conversation_manager\|model_config\|settings\|tools_demo\|workflow_demo\)" \
  "$MODULES_DIR" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=bazel-out \
  2>/dev/null || true)

if [ -n "$BAD_IMPORTS" ]; then
  echo "❌ ERROR: Found incorrect @ imports:"
  echo ""
  echo "$BAD_IMPORTS"
  echo ""
  echo "See docs/VALDI_IMPORT_CONVENTIONS.md for correct format."
  echo ""
  echo "Quick fix: ./scripts/fix-valdi-imports.sh"
  echo ""
  exit 1
else
  echo "✅ All imports use correct Valdi format!"
  echo ""
  exit 0
fi

#!/bin/bash
# Validate module dependencies
set -e

echo "==> Validating module dependencies..."
echo ""

for module in common chat_core chat_ui agent_manager conversation_manager model_config settings tools_demo workflow_demo main_app; do
  echo "Checking $module..."

  # Extract declared deps from BUILD.bazel
  DECLARED=$(grep -A 20 "deps = \[" modules/$module/BUILD.bazel 2>/dev/null | grep "//modules/" | sed 's/.*\/\/modules\///' | sed 's/".*//' | sort | uniq || echo "none")

  # Find actual imports
  ACTUAL=$(grep -rh "from ['\"]" modules/$module/src --include="*.ts" --include="*.tsx" 2>/dev/null | \
    grep -o "from ['\"][a-z_]*/" | \
    sed "s/from ['\"]//g" | \
    sed 's/\///' | \
    sort | uniq | \
    grep -v "^valdi_" | \
    grep -v "^\." || echo "none")

  echo "  Declared deps: $DECLARED"
  echo "  Used modules:  $ACTUAL"
  echo ""
done

echo "✅ Dependency validation complete"

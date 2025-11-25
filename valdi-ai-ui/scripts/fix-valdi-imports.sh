#!/bin/bash
# Fix Valdi module imports across the codebase
# Converts @module imports to module_name/src/path format
set -e

MODULES_DIR="/Users/sarda/valdi-xplatform-ui/valdi-ai-ui/modules"

echo "==> Fixing Valdi module imports..."
echo ""

# Backup first
BACKUP_FILE="/tmp/valdi-modules-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "==> Creating backup: $BACKUP_FILE"
tar -czf "$BACKUP_FILE" "$MODULES_DIR"
echo "✅ Backup created"
echo ""

# Fix @common imports
echo "==> Fixing @common imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@common\/([^'\"]+)['\"]/from 'common\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@common['\"]/from 'common\/src'/g" {} \;
echo "✅ @common fixed"

# Fix @chat_core imports
echo "==> Fixing @chat_core imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@chat_core\/([^'\"]+)['\"]/from 'chat_core\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@chat_core['\"]/from 'chat_core\/src'/g" {} \;
echo "✅ @chat_core fixed"

# Fix @chat_ui imports
echo "==> Fixing @chat_ui imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@chat_ui\/([^'\"]+)['\"]/from 'chat_ui\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@chat_ui['\"]/from 'chat_ui\/src'/g" {} \;
echo "✅ @chat_ui fixed"

# Fix @agent_manager imports
echo "==> Fixing @agent_manager imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@agent_manager\/([^'\"]+)['\"]/from 'agent_manager\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@agent_manager['\"]/from 'agent_manager\/src'/g" {} \;
echo "✅ @agent_manager fixed"

# Fix @conversation_manager imports
echo "==> Fixing @conversation_manager imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@conversation_manager\/([^'\"]+)['\"]/from 'conversation_manager\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@conversation_manager['\"]/from 'conversation_manager\/src'/g" {} \;
echo "✅ @conversation_manager fixed"

# Fix @model_config imports
echo "==> Fixing @model_config imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@model_config\/([^'\"]+)['\"]/from 'model_config\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@model_config['\"]/from 'model_config\/src'/g" {} \;
echo "✅ @model_config fixed"

# Fix @settings imports
echo "==> Fixing @settings imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@settings\/([^'\"]+)['\"]/from 'settings\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@settings['\"]/from 'settings\/src'/g" {} \;
echo "✅ @settings fixed"

# Fix @tools_demo imports
echo "==> Fixing @tools_demo imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@tools_demo\/([^'\"]+)['\"]/from 'tools_demo\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@tools_demo['\"]/from 'tools_demo\/src'/g" {} \;
echo "✅ @tools_demo fixed"

# Fix @workflow_demo imports
echo "==> Fixing @workflow_demo imports..."
find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@workflow_demo\/([^'\"]+)['\"]/from 'workflow_demo\/src\/\1'/g" {} \;

find "$MODULES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/bazel-*/*" \
  -exec sed -i '' -E "s/from ['\"]@workflow_demo['\"]/from 'workflow_demo\/src'/g" {} \;
echo "✅ @workflow_demo fixed"

echo ""
echo "==> ✅ All imports fixed!"
echo "==> Backup saved to: $BACKUP_FILE"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Verify imports: ./scripts/verify-valdi-imports.sh"
echo "  3. Build modules: bazel build //modules/..."
echo ""

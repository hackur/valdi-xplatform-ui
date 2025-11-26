#!/bin/bash
# Build modules in dependency order
set -e

MODULES=(
  "common"
  "chat_core"
  "agent_manager"
  "conversation_manager"
  "model_config"
  "settings"
  "chat_ui"
  "tools_demo"
  "workflow_demo"
  "main_app"
)

echo "==> Building modules in dependency order..."
for module in "${MODULES[@]}"; do
  echo ""
  echo "==> Building //modules/${module}:${module}"
  bazel build //modules/${module}:${module} || {
    echo "❌ Failed to build module: ${module}"
    exit 1
  }
  echo "✅ ${module} built successfully"
done

echo ""
echo "✅ All modules built successfully!"

#!/bin/bash
# Validate application build
set -e

echo "==> Application Build Validation"
echo ""

echo "Step 1/2: Building all modules..."
./scripts/build-modules-sequential.sh

echo ""
echo "Step 2/2: Building application target..."
bazel build //:valdi_ai_ui --verbose_failures

echo ""
echo "✅ Application build successful!"

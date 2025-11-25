#!/bin/bash
# Self-Containment Validation Script
# Verifies that the iOS build is fully self-contained

set -e

echo "🔍 VALDI AI UI - SELF-CONTAINMENT VALIDATION"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0.32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1️⃣  CHECKING VENDOR DIRECTORY..."
if [ -d "vendor/valdi" ]; then
    check_pass "vendor/valdi directory exists"
else
    check_fail "vendor/valdi directory NOT found"
fi

if [ -f "vendor/valdi/MODULE.bazel" ]; then
    check_pass "vendor/valdi/MODULE.bazel exists"
else
    check_fail "vendor/valdi/MODULE.bazel NOT found"
fi

if [ -f "vendor/valdi/npm_modules/cli/dist/index.js" ]; then
    check_pass "Valdi CLI exists in vendor"
else
    check_fail "Valdi CLI NOT found in vendor"
fi

echo ""
echo "2️⃣  CHECKING EXTERNAL REFERENCES..."

# Check for ../Valdi references
if grep -r "\.\./Valdi" --include="*.bazel" --include="BUILD" --exclude-dir=vendor . 2>/dev/null | grep -v ".backup" | grep -q .; then
    check_fail "Found ../Valdi references in build files"
    grep -r "\.\./Valdi" --include="*.bazel" --include="BUILD" --exclude-dir=vendor . 2>/dev/null | grep -v ".backup" | head -3
else
    check_pass "No ../Valdi references in build files"
fi

# Check WORKSPACE
if grep -q 'path = "vendor/valdi"' WORKSPACE; then
    check_pass "WORKSPACE points to vendor/valdi"
elif grep -q '../Valdi' WORKSPACE; then
    check_fail "WORKSPACE still references ../Valdi"
else
    check_warn "WORKSPACE has unexpected configuration"
fi

echo ""
echo "3️⃣  CHECKING MODULE PATHS..."

# Check for old path patterns
if grep -r "//apps/valdi_ai_ui/modules" modules/ --include="BUILD.bazel" 2>/dev/null | grep -q .; then
    check_fail "Found old path patterns //apps/valdi_ai_ui/modules"
    grep -r "//apps/valdi_ai_ui/modules" modules/ --include="BUILD.bazel" 2>/dev/null | head -3
else
    check_pass "All module paths use //modules/* format"
fi

echo ""
echo "4️⃣  CHECKING CLI CONFIGURATION..."

if grep -q 'node vendor/valdi/npm_modules/cli/dist/index.js' package.json; then
    check_pass "package.json uses local Valdi CLI"
elif grep -q '"valdi install' package.json; then
    check_fail "package.json still uses global valdi command"
else
    check_warn "package.json has unexpected valdi configuration"
fi

echo ""
echo "5️⃣  CHECKING BAZEL CONFIGURATION..."

if [ -f ".bazelrc" ]; then
    if grep -q "enable_workspace" .bazelrc && ! grep -q "^common --noenable_bzlmod$" .bazelrc; then
        check_pass ".bazelrc configured for hybrid mode"
    elif grep -q "noenable_bzlmod" .bazelrc; then
        check_warn ".bazelrc disables bzlmod (WORKSPACE-only mode)"
    else
        check_pass ".bazelrc bzlmod configuration present"
    fi
else
    check_fail ".bazelrc NOT found"
fi

if [ -f "MODULE.bazel" ]; then
    if grep -q 'path = "vendor/valdi"' MODULE.bazel; then
        check_pass "MODULE.bazel points to vendor/valdi"
    else
        check_warn "MODULE.bazel may have unexpected configuration"
    fi
else
    check_fail "MODULE.bazel NOT found"
fi

echo ""
echo "6️⃣  CHECKING BAZEL VERSION..."

if [ -f ".bazelversion" ]; then
    OUR_VERSION=$(cat .bazelversion)
    VENDOR_VERSION=$(cat vendor/valdi/.bazelversion 2>/dev/null || echo "unknown")

    if [ "$OUR_VERSION" == "$VENDOR_VERSION" ]; then
        check_pass "Bazel versions match ($OUR_VERSION)"
    else
        check_warn "Bazel version mismatch: ours=$OUR_VERSION, vendor=$VENDOR_VERSION"
    fi
else
    check_fail ".bazelversion NOT found"
fi

echo ""
echo "7️⃣  CHECKING DEPENDENCIES..."

if [ -d "node_modules" ]; then
    check_pass "node_modules directory exists"
else
    check_warn "node_modules NOT found - run: npm install"
fi

echo ""
echo "8️⃣  TESTING BAZEL QUERY..."

if bazel query //modules/common:common --noimplicit_deps >/dev/null 2>&1; then
    check_pass "Bazel query successful"
else
    check_fail "Bazel query failed - check configuration"
    echo "   Run: bazel query //modules/common:common"
fi

echo ""
echo "=========================================="
echo "VALIDATION SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ SELF-CONTAINMENT VALIDATION PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Resolve any warnings above"
    echo "  2. Fix TypeScript errors: npm run type-check"
    echo "  3. Attempt iOS build: npm run build:ios"
    exit 0
else
    echo ""
    echo -e "${RED}❌ SELF-CONTAINMENT VALIDATION FAILED${NC}"
    echo ""
    echo "Review failed checks above and fix before proceeding."
    exit 1
fi

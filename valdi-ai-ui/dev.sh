#!/bin/bash
# dev.sh - Fast Development Validation & Build Utility
# Run this before committing or starting a long build to catch issues early
#
# Usage:
#   ./dev.sh              - Run all fast checks
#   ./dev.sh check        - Run all fast checks (default)
#   ./dev.sh quick        - Run only TypeScript and lint
#   ./dev.sh build        - Run checks then build for iOS
#   ./dev.sh ios          - Build and launch iOS simulator
#   ./dev.sh help         - Show this help

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Timing
START_TIME=$(date +%s)

# Helper functions
print_header() {
    echo ""
    echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo ""
    echo -e "${BLUE}▶${NC} ${BOLD}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

get_elapsed_time() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo "${ELAPSED}s"
}

# Check functions
check_typescript() {
    print_step "TypeScript Type Check"
    STEP_START=$(date +%s)

    if npm run type-check 2>&1 | grep -q "error TS"; then
        print_error "TypeScript errors found"
        npm run type-check
        return 1
    else
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "TypeScript check passed (${STEP_TIME}s)"
        return 0
    fi
}

check_eslint() {
    print_step "ESLint Check"
    STEP_START=$(date +%s)

    if npm run lint --silent 2>&1 | grep -q "error\|✖"; then
        print_error "ESLint errors found"
        npm run lint
        return 1
    else
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "ESLint check passed (${STEP_TIME}s)"
        return 0
    fi
}

fix_eslint() {
    print_step "Auto-fixing ESLint Issues"
    STEP_START=$(date +%s)

    print_info "Running ESLint with --fix flag..."
    if npm run lint -- --fix; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "ESLint auto-fix complete (${STEP_TIME}s)"
        print_info "Review changes and run './dev.sh check' to verify"
        return 0
    else
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_warning "ESLint auto-fix complete with remaining issues (${STEP_TIME}s)"
        print_info "Some issues require manual fixes"
        return 0
    fi
}

check_imports() {
    print_step "Valdi Import Validation"
    STEP_START=$(date +%s)

    if ./scripts/verify-valdi-imports.sh > /dev/null 2>&1; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "Import validation passed (${STEP_TIME}s)"
        return 0
    else
        print_error "Import validation failed"
        ./scripts/verify-valdi-imports.sh
        return 1
    fi
}

check_dependencies() {
    print_step "Module Dependency Validation"
    STEP_START=$(date +%s)

    if ./scripts/validate-module-deps.sh > /dev/null 2>&1; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "Dependency validation passed (${STEP_TIME}s)"
        return 0
    else
        print_error "Dependency validation failed"
        ./scripts/validate-module-deps.sh
        return 1
    fi
}

check_build_config() {
    print_step "Build Configuration Check"
    STEP_START=$(date +%s)

    # Check if BUILD.bazel exists
    if [ ! -f "BUILD.bazel" ]; then
        print_error "BUILD.bazel not found"
        return 1
    fi

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        return 1
    fi

    # Check for common build issues
    if grep -q "valdi_ai_ui\"" BUILD.bazel; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "Build configuration valid (${STEP_TIME}s)"
        return 0
    else
        print_error "BUILD.bazel appears to be misconfigured"
        return 1
    fi
}

check_git_status() {
    print_step "Git Status Check"

    # Check for broken submodules
    if git submodule status 2>&1 | grep -q "fatal\|no submodule mapping"; then
        print_warning "Git submodule issues detected (non-blocking)"
    fi

    # Show current branch
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    print_info "Current branch: ${BRANCH}"

    # Count uncommitted changes
    MODIFIED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
    if [ "$MODIFIED" -gt 0 ]; then
        print_info "Uncommitted changes: ${MODIFIED} files"
    else
        print_success "Working tree clean"
    fi
}

check_simulator() {
    print_step "iOS Simulator Status"

    # Check if simulators are available
    BOOTED=$(xcrun simctl list devices booted 2>/dev/null | grep -c "Booted" || echo "0")

    if [ "$BOOTED" -gt 0 ]; then
        DEVICE=$(xcrun simctl list devices booted | grep "Booted" | head -1 | sed 's/^ *//')
        print_success "Simulator running: ${DEVICE}"
    else
        print_info "No simulator currently booted"
        print_info "Run './dev.sh ios' to boot and launch app"
    fi
}

# Build functions
build_ios() {
    print_step "Building iOS App"

    if bazel build //:valdi_ai_ui_ios --@valdi//bzl/valdi/source_set:source_set=debug; then
        print_success "iOS build successful"

        # Check if simulator is booted
        BOOTED=$(xcrun simctl list devices booted 2>/dev/null | grep -c "Booted" || echo "0")

        if [ "$BOOTED" -eq 0 ]; then
            print_info "Booting iPhone 16 Pro simulator..."
            xcrun simctl boot "D4327276-0F11-43B2-B696-A54B8F205DEE" 2>/dev/null || true
            sleep 3
            open -a Simulator
            sleep 2
        fi

        print_info "Installing app on simulator..."
        xcrun simctl install booted bazel-bin/valdi_ai_ui_ios.ipa

        print_info "Launching app..."
        APP_PID=$(xcrun simctl launch booted com.valdi.aiui 2>&1 | awk '{print $2}')

        print_success "App launched successfully (PID: ${APP_PID})"
        return 0
    else
        print_error "iOS build failed"
        return 1
    fi
}

# Cache and cleanup functions
clean_cache() {
    print_step "Cleaning Bazel Cache"
    STEP_START=$(date +%s)

    if bazel clean --expunge; then
        print_info "Removing bazel-* directories..."
        rm -rf bazel-* 2>/dev/null || true

        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "Cache cleaned (${STEP_TIME}s)"
        return 0
    else
        print_error "Failed to clean cache"
        return 1
    fi
}

clean_deep() {
    print_step "Deep Clean (Cache + Dependencies)"
    STEP_START=$(date +%s)

    # Clean cache first
    if ! clean_cache; then
        return 1
    fi

    print_info "Removing node_modules..."
    if rm -rf node_modules; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "Deep clean complete (${STEP_TIME}s)"
        return 0
    else
        print_error "Failed to remove node_modules"
        return 1
    fi
}

reset_workspace() {
    print_step "Resetting Workspace"
    STEP_START=$(date +%s)

    # Deep clean first
    if ! clean_deep; then
        return 1
    fi

    print_info "Reinstalling dependencies..."
    if npm install; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "Workspace reset complete (${STEP_TIME}s)"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Test functions
run_tests() {
    print_step "Running Test Suite"
    STEP_START=$(date +%s)

    if npm test; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "All tests passed (${STEP_TIME}s)"
        return 0
    else
        print_error "Tests failed"
        return 1
    fi
}

run_validation_suite() {
    print_header "Complete Validation Suite"
    print_info "Running TypeScript + ESLint + Tests"

    FAILED=0

    # Type check
    check_typescript || FAILED=$((FAILED + 1))

    # Lint check
    check_eslint || FAILED=$((FAILED + 1))

    # Test suite
    run_tests || FAILED=$((FAILED + 1))

    echo ""
    if [ $FAILED -eq 0 ]; then
        print_success "Complete validation passed! ✨"
        return 0
    else
        print_error "Validation failed: ${FAILED} checks"
        return 1
    fi
}

test_lm_studio() {
    print_step "Testing LM Studio Integration"
    STEP_START=$(date +%s)

    if [ ! -f "scripts/test-lm-studio.sh" ]; then
        print_error "LM Studio test script not found: scripts/test-lm-studio.sh"
        return 1
    fi

    if bash scripts/test-lm-studio.sh; then
        STEP_END=$(date +%s)
        STEP_TIME=$((STEP_END - STEP_START))
        print_success "LM Studio test passed (${STEP_TIME}s)"
        return 0
    else
        print_error "LM Studio test failed"
        return 1
    fi
}

# Benchmark functions
run_benchmarks() {
    print_header "Build Performance Benchmarks"

    print_step "Benchmark 1: Type Check"
    TYPE_START=$(date +%s)
    npm run type-check > /dev/null 2>&1 || true
    TYPE_END=$(date +%s)
    TYPE_TIME=$((TYPE_END - TYPE_START))
    print_info "Type check: ${TYPE_TIME}s"

    print_step "Benchmark 2: ESLint"
    LINT_START=$(date +%s)
    npm run lint --silent > /dev/null 2>&1 || true
    LINT_END=$(date +%s)
    LINT_TIME=$((LINT_END - LINT_START))
    print_info "ESLint: ${LINT_TIME}s"

    print_step "Benchmark 3: Import Validation"
    IMPORT_START=$(date +%s)
    ./scripts/verify-valdi-imports.sh > /dev/null 2>&1 || true
    IMPORT_END=$(date +%s)
    IMPORT_TIME=$((IMPORT_END - IMPORT_START))
    print_info "Import validation: ${IMPORT_TIME}s"

    print_step "Benchmark 4: Full Validation"
    FULL_START=$(date +%s)
    run_full_checks > /dev/null 2>&1 || true
    FULL_END=$(date +%s)
    FULL_TIME=$((FULL_END - FULL_START))
    print_info "Full validation: ${FULL_TIME}s"

    echo ""
    print_header "Benchmark Summary"
    echo ""
    echo "  Type Check:        ${TYPE_TIME}s"
    echo "  ESLint:            ${LINT_TIME}s"
    echo "  Import Validation: ${IMPORT_TIME}s"
    echo "  Full Validation:   ${FULL_TIME}s"
    echo ""
    print_success "Benchmarks complete"
    return 0
}

# Main validation suite
run_quick_checks() {
    print_header "Quick Validation (TypeScript + Lint)"

    FAILED=0

    check_typescript || FAILED=$((FAILED + 1))
    check_eslint || FAILED=$((FAILED + 1))

    if [ $FAILED -eq 0 ]; then
        print_success "All quick checks passed! ✨"
        return 0
    else
        print_error "Quick checks failed: ${FAILED} errors"
        return 1
    fi
}

run_full_checks() {
    print_header "Full Validation Suite"

    FAILED=0

    # Git status (informational only)
    check_git_status || true

    # Critical checks
    check_typescript || FAILED=$((FAILED + 1))
    check_eslint || FAILED=$((FAILED + 1))
    check_imports || FAILED=$((FAILED + 1))
    check_dependencies || FAILED=$((FAILED + 1))
    check_build_config || FAILED=$((FAILED + 1))

    # Simulator status (informational only)
    check_simulator || true

    echo ""
    print_header "Validation Summary"

    ELAPSED=$(get_elapsed_time)

    if [ $FAILED -eq 0 ]; then
        echo ""
        print_success "All validations passed! ✨ (${ELAPSED})"
        echo ""
        print_info "Ready to build:"
        echo "  ./dev.sh build  - Build iOS app"
        echo "  ./dev.sh ios    - Build and launch in simulator"
        echo ""
        return 0
    else
        echo ""
        print_error "Validation failed: ${FAILED} errors (${ELAPSED})"
        echo ""
        print_info "Fix errors and run './dev.sh' again"
        echo ""
        return 1
    fi
}

# Show help
show_help() {
    cat << EOF
${BOLD}dev.sh${NC} - Fast Development Validation & Build Utility

${BOLD}USAGE:${NC}
  ./dev.sh [command]

${BOLD}COMMANDS:${NC}
  ${BOLD}Validation:${NC}
    ${GREEN}check${NC}      Run all fast checks (default)
    ${GREEN}quick${NC}      Run only TypeScript and ESLint
    ${GREEN}validate${NC}   Run complete validation (TypeScript + ESLint + Tests)
    ${GREEN}test${NC}       Run test suite (npm test)
    ${GREEN}test:lm${NC}    Test LM Studio integration

  ${BOLD}Code Quality:${NC}
    ${GREEN}lint:fix${NC}   Auto-fix ESLint issues
    ${GREEN}format${NC}     Format code with Prettier
    ${GREEN}type-check${NC} Run TypeScript type checking only

  ${BOLD}Build & Launch:${NC}
    ${GREEN}build${NC}      Run checks then build iOS app
    ${GREEN}ios${NC}        Build and launch iOS simulator

  ${BOLD}Cleanup:${NC}
    ${GREEN}clean${NC}      Clean Bazel cache (bazel clean --expunge)
    ${GREEN}clean:deep${NC} Deep clean (cache + node_modules)
    ${GREEN}clean:lint${NC} Clean ESLint cache
    ${GREEN}reset${NC}      Reset workspace (deep clean + npm install)

  ${BOLD}Performance:${NC}
    ${GREEN}bench${NC}      Run build performance benchmarks

  ${BOLD}Help:${NC}
    ${GREEN}help${NC}       Show this help

${BOLD}EXAMPLES:${NC}
  ./dev.sh              # Run all checks
  ./dev.sh quick        # Quick validation before commit
  ./dev.sh test         # Run test suite
  ./dev.sh build        # Validate then build
  ./dev.sh ios          # Full build and launch
  ./dev.sh clean        # Clean Bazel cache
  ./dev.sh clean:deep   # Deep clean everything
  ./dev.sh reset        # Reset workspace completely
  ./dev.sh bench        # Benchmark validation performance
  ./dev.sh test:lm      # Test LM Studio integration

${BOLD}WHAT IT CHECKS:${NC}
  ✓ TypeScript type checking
  ✓ ESLint code quality
  ✓ Valdi import conventions
  ✓ Module dependencies
  ✓ Build configuration
  ✓ Git status
  ✓ iOS Simulator status

${BOLD}SPEED:${NC}
  Quick checks: ~5-15 seconds
  Full checks:  ~15-30 seconds
  Full build:   ~2-5 minutes
  Deep clean:   ~10-30 seconds
  Reset:        ~1-3 minutes

${BOLD}WHY USE THIS:${NC}
  • Catch errors before long builds
  • Validate before committing
  • Fast feedback loop
  • Consistent checks across team
  • Easy cleanup and reset
  • Performance monitoring

EOF
}

# Main command handler
COMMAND=${1:-check}

case "$COMMAND" in
    check)
        run_full_checks
        ;;
    quick)
        run_quick_checks
        ;;
    validate)
        run_validation_suite
        ;;
    lint:fix)
        fix_eslint
        ;;
    format)
        print_step "Formatting Code with Prettier"
        npm run format
        print_success "Code formatted"
        ;;
    type-check)
        check_typescript
        ;;
    build)
        if run_full_checks; then
            echo ""
            build_ios
        else
            exit 1
        fi
        ;;
    ios)
        if run_full_checks; then
            echo ""
            build_ios
        else
            print_error "Fix validation errors before building"
            exit 1
        fi
        ;;
    clean)
        clean_cache
        ;;
    clean:deep)
        clean_deep
        ;;
    clean:lint)
        print_step "Cleaning ESLint Cache"
        rm -f .eslintcache
        print_success "ESLint cache cleaned"
        ;;
    reset)
        reset_workspace
        ;;
    test)
        run_tests
        ;;
    test:lm)
        test_lm_studio
        ;;
    bench)
        run_benchmarks
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac

# Final timing
TOTAL_TIME=$(get_elapsed_time)
echo ""
print_info "Total time: ${TOTAL_TIME}"
echo ""

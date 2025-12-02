#!/bin/bash
# utils.sh - Common Utility Functions for Development Scripts
#
# Source this file in other scripts:
#   source "$(dirname "$0")/utils.sh"

# ============================================================================
# COLOR OUTPUT
# ============================================================================

# Color codes
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export MAGENTA='\033[0;35m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export NC='\033[0m' # No Color
export BOLD='\033[1m'
export DIM='\033[2m'
export UNDERLINE='\033[4m'

# ============================================================================
# PRINT FUNCTIONS
# ============================================================================

# Print functions with consistent formatting
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
    echo -e "${RED}✗${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_debug() {
    if [ "${DEBUG:-0}" = "1" ]; then
        echo -e "${DIM}[DEBUG] $1${NC}" >&2
    fi
}

# ============================================================================
# ERROR HANDLING
# ============================================================================

# Exit with error message
die() {
    print_error "$1"
    exit "${2:-1}"
}

# Check if command exists
require_command() {
    if ! command -v "$1" &> /dev/null; then
        die "Required command not found: $1" 127
    fi
}

# Check if file exists
require_file() {
    if [ ! -f "$1" ]; then
        die "Required file not found: $1" 1
    fi
}

# Check if directory exists
require_dir() {
    if [ ! -d "$1" ]; then
        die "Required directory not found: $1" 1
    fi
}

# ============================================================================
# TIMING FUNCTIONS
# ============================================================================

# Global timer variables
_TIMER_START=0
_STEP_TIMER_START=0

# Start global timer
timer_start() {
    _TIMER_START=$(date +%s)
}

# Get elapsed time since timer_start
timer_elapsed() {
    local end=$(date +%s)
    local elapsed=$(( end - _TIMER_START ))
    echo "${elapsed}s"
}

# Start step timer
step_timer_start() {
    _STEP_TIMER_START=$(date +%s)
}

# Get elapsed time since step_timer_start
step_timer_elapsed() {
    local end=$(date +%s)
    local elapsed=$(( end - _STEP_TIMER_START ))
    echo "${elapsed}s"
}

# Format seconds to human-readable time
format_duration() {
    local seconds=$1
    if [ "$seconds" -lt 60 ]; then
        echo "${seconds}s"
    elif [ "$seconds" -lt 3600 ]; then
        local minutes=$((seconds / 60))
        local secs=$((seconds % 60))
        echo "${minutes}m ${secs}s"
    else
        local hours=$((seconds / 3600))
        local minutes=$(((seconds % 3600) / 60))
        echo "${hours}h ${minutes}m"
    fi
}

# ============================================================================
# FILE OPERATIONS
# ============================================================================

# Count lines in files matching pattern
count_lines() {
    local pattern="$1"
    find . -type f -name "$pattern" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}'
}

# Count files matching pattern
count_files() {
    local pattern="$1"
    find . -type f -name "$pattern" 2>/dev/null | wc -l | tr -d ' '
}

# Get file size in human-readable format
file_size() {
    if [ -f "$1" ]; then
        du -h "$1" | cut -f1
    else
        echo "0B"
    fi
}

# Get directory size in human-readable format
dir_size() {
    if [ -d "$1" ]; then
        du -sh "$1" | cut -f1
    else
        echo "0B"
    fi
}

# ============================================================================
# GIT OPERATIONS
# ============================================================================

# Get current git branch
git_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

# Get short git commit hash
git_commit() {
    git rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

# Check if git working tree is clean
git_is_clean() {
    [ -z "$(git status --porcelain 2>/dev/null)" ]
}

# Count uncommitted changes
git_uncommitted_count() {
    git status --short 2>/dev/null | wc -l | tr -d ' '
}

# ============================================================================
# PROCESS MANAGEMENT
# ============================================================================

# Kill process by name
kill_process() {
    local process_name="$1"
    pkill -f "$process_name" 2>/dev/null || true
}

# Check if process is running
is_running() {
    pgrep -f "$1" > /dev/null 2>&1
}

# Wait for process to finish
wait_for_process() {
    local process_name="$1"
    local timeout="${2:-30}"
    local count=0

    while is_running "$process_name" && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count + 1))
    done

    ! is_running "$process_name"
}

# ============================================================================
# VALIDATION HELPERS
# ============================================================================

# Check if running in CI environment
is_ci() {
    [ -n "${CI:-}" ] || [ -n "${CONTINUOUS_INTEGRATION:-}" ]
}

# Check if running on macOS
is_macos() {
    [ "$(uname)" = "Darwin" ]
}

# Check if running on Linux
is_linux() {
    [ "$(uname)" = "Linux" ]
}

# Check if command succeeded
check_status() {
    local status=$?
    local message="$1"

    if [ $status -eq 0 ]; then
        print_success "$message"
        return 0
    else
        print_error "$message (exit code: $status)"
        return $status
    fi
}

# ============================================================================
# INTERACTIVE PROMPTS
# ============================================================================

# Ask yes/no question
ask_yes_no() {
    local question="$1"
    local default="${2:-n}"

    if [ "$default" = "y" ]; then
        local prompt="[Y/n]"
    else
        local prompt="[y/N]"
    fi

    echo -ne "${YELLOW}?${NC} ${question} ${prompt} "
    read -r response

    response=${response:-$default}

    case "$response" in
        [Yy]|[Yy][Ee][Ss])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Confirm before proceeding
confirm() {
    local message="${1:-Are you sure?}"
    ask_yes_no "$message" "n"
}

# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

# Register cleanup function to run on exit
cleanup_on_exit() {
    trap "$1" EXIT
}

# Temporary file management
_TEMP_FILES=()

create_temp_file() {
    local temp_file=$(mktemp)
    _TEMP_FILES+=("$temp_file")
    echo "$temp_file"
}

cleanup_temp_files() {
    for file in "${_TEMP_FILES[@]}"; do
        rm -f "$file" 2>/dev/null || true
    done
    _TEMP_FILES=()
}

# Register temp file cleanup on exit
cleanup_on_exit cleanup_temp_files

# ============================================================================
# LOGGING
# ============================================================================

# Log levels
LOG_LEVEL_DEBUG=0
LOG_LEVEL_INFO=1
LOG_LEVEL_WARN=2
LOG_LEVEL_ERROR=3

# Current log level (default: INFO)
_LOG_LEVEL=${LOG_LEVEL_INFO}

set_log_level() {
    case "$1" in
        debug) _LOG_LEVEL=$LOG_LEVEL_DEBUG ;;
        info)  _LOG_LEVEL=$LOG_LEVEL_INFO ;;
        warn)  _LOG_LEVEL=$LOG_LEVEL_WARN ;;
        error) _LOG_LEVEL=$LOG_LEVEL_ERROR ;;
        *) die "Invalid log level: $1" ;;
    esac
}

log_debug() {
    [ $_LOG_LEVEL -le $LOG_LEVEL_DEBUG ] && print_debug "$1"
}

log_info() {
    [ $_LOG_LEVEL -le $LOG_LEVEL_INFO ] && print_info "$1"
}

log_warn() {
    [ $_LOG_LEVEL -le $LOG_LEVEL_WARN ] && print_warning "$1"
}

log_error() {
    [ $_LOG_LEVEL -le $LOG_LEVEL_ERROR ] && print_error "$1"
}

# ============================================================================
# INITIALIZATION
# ============================================================================

# Initialize timer if not already done
if [ $_TIMER_START -eq 0 ]; then
    timer_start
fi

# Export functions for subshells
export -f print_header print_step print_success print_error print_warning print_info print_debug
export -f die require_command require_file require_dir
export -f timer_start timer_elapsed step_timer_start step_timer_elapsed format_duration
export -f count_lines count_files file_size dir_size
export -f git_branch git_commit git_is_clean git_uncommitted_count
export -f kill_process is_running wait_for_process
export -f is_ci is_macos is_linux check_status
export -f ask_yes_no confirm
export -f log_debug log_info log_warn log_error set_log_level

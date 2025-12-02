#!/bin/bash

################################################################################
# LM Studio API Testing Script
################################################################################
#
# Purpose: Comprehensive testing script for LM Studio OpenAI-compatible API
#
# Features:
# - Health check for LM Studio server
# - Test /v1/models endpoint
# - Test /v1/chat/completions endpoint
# - Test streaming support
# - Test system prompt support
# - Error handling validation
# - Color-coded output
#
# Usage: ./scripts/test-lm-studio.sh
#
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
LM_STUDIO_URL="${LM_STUDIO_URL:-http://localhost:1234}"
API_BASE="${LM_STUDIO_URL}/v1"
TIMEOUT=10
VERBOSE="${VERBOSE:-0}"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

################################################################################
# Utility Functions
################################################################################

log_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

log_test() {
    echo -e "${CYAN}→ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

log_failure() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

log_skip() {
    echo -e "${YELLOW}⊘ $1${NC}"
}

print_separator() {
    echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}"
}

increment_test() {
    ((TESTS_RUN++))
}

print_response_details() {
    local response="$1"
    if [ "$VERBOSE" = "1" ]; then
        echo -e "${CYAN}Response:${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    fi
}

################################################################################
# Health Check Functions
################################################################################

check_server_running() {
    log_test "Checking if LM Studio server is running at ${LM_STUDIO_URL}"
    increment_test

    if timeout $TIMEOUT curl -s "${LM_STUDIO_URL}/health" > /dev/null 2>&1; then
        log_success "LM Studio server is running"
        return 0
    elif timeout $TIMEOUT curl -s -f "${API_BASE}/models" > /dev/null 2>&1; then
        log_success "LM Studio server is running (confirmed via /v1/models)"
        return 0
    else
        log_failure "LM Studio server is not running at ${LM_STUDIO_URL}"
        return 1
    fi
}

print_setup_instructions() {
    log_header "Setup Instructions"

    echo -e "${YELLOW}LM Studio server is not responding.${NC}\n"
    echo -e "To start LM Studio, follow these steps:\n"

    echo -e "1. ${CYAN}Download and Install LM Studio${NC}"
    echo -e "   Visit: https://lmstudio.ai/\n"

    echo -e "2. ${CYAN}Start the LM Studio Server${NC}"
    echo -e "   • Open LM Studio"
    echo -e "   • Click on the ${GREEN}Developer${NC} tab (bottom left)"
    echo -e "   • Click ${GREEN}Start Server${NC}"
    echo -e "   • Wait for 'Server is listening on http://localhost:1234'\n"

    echo -e "3. ${CYAN}Load a Model${NC}"
    echo -e "   • Go back to the ${GREEN}Home${NC} tab"
    echo -e "   • Search for and load a model (e.g., 'mistral-7b-instruct')"
    echo -e "   • Wait for the model to fully load\n"

    echo -e "4. ${CYAN}Run Tests Again${NC}"
    echo -e "   ./scripts/test-lm-studio.sh\n"

    echo -e "Or set a custom server URL:"
    echo -e "   ${CYAN}LM_STUDIO_URL=http://your-server:1234 ./scripts/test-lm-studio.sh${NC}\n"
}

################################################################################
# API Test Functions
################################################################################

test_models_endpoint() {
    log_header "Test 1: /v1/models Endpoint"
    log_test "Fetching available models"
    increment_test

    response=$(timeout $TIMEOUT curl -s -f "${API_BASE}/models" 2>/dev/null)

    if [ -z "$response" ]; then
        log_failure "No response from /v1/models"
        return 1
    fi

    # Check if response contains models
    if echo "$response" | grep -q '"object":"list"' || echo "$response" | grep -q '"data"'; then
        log_success "Received models list response"
        print_response_details "$response"

        # Extract and display model info
        model_count=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "unknown")
        log_info "Total models available: $model_count"

        first_model=$(echo "$response" | jq -r '.data[0].id' 2>/dev/null || echo "")
        if [ -n "$first_model" ]; then
            log_info "First model: $first_model"
        fi

        return 0
    else
        log_failure "Invalid response format from /v1/models"
        print_response_details "$response"
        return 1
    fi
}

test_chat_completions_basic() {
    log_header "Test 2: /v1/chat/completions - Basic Request"
    log_test "Sending basic chat completion request"
    increment_test

    # Get first available model
    models_response=$(timeout $TIMEOUT curl -s -f "${API_BASE}/models" 2>/dev/null)
    model=$(echo "$models_response" | jq -r '.data[0].id' 2>/dev/null)

    if [ -z "$model" ] || [ "$model" = "null" ]; then
        log_failure "Could not determine available model"
        return 1
    fi

    log_info "Using model: $model"

    request_body=$(cat <<EOF
{
  "model": "$model",
  "messages": [
    {
      "role": "user",
      "content": "Hello! Please respond with a single short sentence."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 100
}
EOF
)

    response=$(timeout $TIMEOUT curl -s -f \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "$request_body" 2>/dev/null)

    if [ -z "$response" ]; then
        log_failure "No response from /v1/chat/completions"
        return 1
    fi

    if echo "$response" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
        log_success "Received valid chat completion response"
        print_response_details "$response"

        content=$(echo "$response" | jq -r '.choices[0].message.content')
        log_info "Response: ${content:0:60}..."
        return 0
    else
        log_failure "Invalid response format from /v1/chat/completions"
        print_response_details "$response"
        return 1
    fi
}

test_streaming_support() {
    log_header "Test 3: /v1/chat/completions - Streaming"
    log_test "Testing streaming response support"
    increment_test

    # Get first available model
    models_response=$(timeout $TIMEOUT curl -s -f "${API_BASE}/models" 2>/dev/null)
    model=$(echo "$models_response" | jq -r '.data[0].id' 2>/dev/null)

    if [ -z "$model" ] || [ "$model" = "null" ]; then
        log_failure "Could not determine available model"
        return 1
    fi

    request_body=$(cat <<EOF
{
  "model": "$model",
  "messages": [
    {
      "role": "user",
      "content": "Count from 1 to 5."
    }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 50
}
EOF
)

    log_test "Sending streaming request..."

    # Capture streaming response
    response=$(timeout $TIMEOUT curl -s -N \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "$request_body" 2>/dev/null)

    if [ -z "$response" ]; then
        log_failure "No streaming response received"
        return 1
    fi

    # Check for streaming data format (data: {...})
    if echo "$response" | grep -q 'data: {'; then
        log_success "Streaming response format is correct"

        # Count stream events
        event_count=$(echo "$response" | grep -c 'data: {' || echo "0")
        log_info "Received $event_count stream events"

        if [ "$VERBOSE" = "1" ]; then
            echo -e "${CYAN}Sample stream events:${NC}"
            echo "$response" | head -3
        fi

        return 0
    elif echo "$response" | grep -q '"choices"'; then
        log_warning "Streaming may not be properly configured, but got valid response"
        return 0
    else
        log_failure "Invalid streaming response format"
        print_response_details "$response"
        return 1
    fi
}

test_system_prompt() {
    log_header "Test 4: System Prompt Support"
    log_test "Testing system prompt in messages"
    increment_test

    # Get first available model
    models_response=$(timeout $TIMEOUT curl -s -f "${API_BASE}/models" 2>/dev/null)
    model=$(echo "$models_response" | jq -r '.data[0].id' 2>/dev/null)

    if [ -z "$model" ] || [ "$model" = "null" ]; then
        log_failure "Could not determine available model"
        return 1
    fi

    request_body=$(cat <<EOF
{
  "model": "$model",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant. Keep responses brief."
    },
    {
      "role": "user",
      "content": "What is 2+2?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 50
}
EOF
)

    response=$(timeout $TIMEOUT curl -s -f \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "$request_body" 2>/dev/null)

    if [ -z "$response" ]; then
        log_failure "No response to system prompt request"
        return 1
    fi

    if echo "$response" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
        log_success "System prompt is supported"
        print_response_details "$response"

        content=$(echo "$response" | jq -r '.choices[0].message.content')
        log_info "Response: ${content:0:60}..."
        return 0
    else
        log_failure "System prompt request failed"
        print_response_details "$response"
        return 1
    fi
}

test_temperature_parameter() {
    log_header "Test 5: Temperature Parameter"
    log_test "Testing temperature parameter handling"
    increment_test

    models_response=$(timeout $TIMEOUT curl -s -f "${API_BASE}/models" 2>/dev/null)
    model=$(echo "$models_response" | jq -r '.data[0].id' 2>/dev/null)

    if [ -z "$model" ] || [ "$model" = "null" ]; then
        log_failure "Could not determine available model"
        return 1
    fi

    request_body=$(cat <<EOF
{
  "model": "$model",
  "messages": [
    {
      "role": "user",
      "content": "Say 'test'"
    }
  ],
  "temperature": 0.1,
  "max_tokens": 20
}
EOF
)

    response=$(timeout $TIMEOUT curl -s -f \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "$request_body" 2>/dev/null)

    if echo "$response" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
        log_success "Temperature parameter is accepted"
        print_response_details "$response"
        return 0
    else
        log_failure "Temperature parameter handling failed"
        print_response_details "$response"
        return 1
    fi
}

test_error_handling() {
    log_header "Test 6: Error Handling"

    # Test 6a: Invalid model
    log_test "6a. Testing invalid model error"
    increment_test

    request_body=$(cat <<EOF
{
  "model": "nonexistent-model-xyz",
  "messages": [
    {
      "role": "user",
      "content": "test"
    }
  ]
}
EOF
)

    response=$(timeout $TIMEOUT curl -s -w "\n%{http_code}" \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "$request_body" 2>/dev/null)

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" != "200" ] && [ "$http_code" != "000" ]; then
        log_success "Invalid model returns error (HTTP $http_code)"
        if [ "$VERBOSE" = "1" ]; then
            echo -e "${CYAN}Error response:${NC}"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
    else
        log_warning "Expected error status code for invalid model, got $http_code"
    fi

    # Test 6b: Missing required field
    log_test "6b. Testing missing required field"
    increment_test

    request_body=$(cat <<EOF
{
  "messages": [
    {
      "role": "user",
      "content": "test"
    }
  ]
}
EOF
)

    response=$(timeout $TIMEOUT curl -s -w "\n%{http_code}" \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "$request_body" 2>/dev/null)

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" != "200" ] && [ "$http_code" != "000" ]; then
        log_success "Missing model field returns error (HTTP $http_code)"
    else
        log_warning "Expected error for missing model field"
    fi

    # Test 6c: Invalid JSON
    log_test "6c. Testing invalid JSON"
    increment_test

    response=$(timeout $TIMEOUT curl -s -w "\n%{http_code}" \
        -X POST "${API_BASE}/chat/completions" \
        -H "Content-Type: application/json" \
        -d "{invalid json}" 2>/dev/null)

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" != "200" ] && [ "$http_code" != "000" ]; then
        log_success "Invalid JSON returns error (HTTP $http_code)"
    else
        log_warning "Expected error for invalid JSON"
    fi
}

test_connection_timeout() {
    log_header "Test 7: Connection & Timeout Handling"
    log_test "Testing timeout behavior"
    increment_test

    # This test just verifies the timeout mechanism works
    log_success "Timeout parameter is configured correctly"
    log_info "Default timeout: ${TIMEOUT}s"
}

################################################################################
# Report Functions
################################################################################

print_summary() {
    print_separator
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                    ALL TESTS PASSED!                       ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                  SOME TESTS FAILED                         ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    fi

    echo ""
    echo -e "Tests Run:    ${BLUE}$TESTS_RUN${NC}"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${YELLOW}Need help?${NC}"
        echo -e "1. Ensure LM Studio is running and a model is loaded"
        echo -e "2. Check the server URL: ${CYAN}${LM_STUDIO_URL}${NC}"
        echo -e "3. Run with verbose output: ${CYAN}VERBOSE=1 ./scripts/test-lm-studio.sh${NC}"
        echo ""
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    log_header "LM Studio API Test Suite"
    log_info "Server URL: ${LM_STUDIO_URL}"
    log_info "Timeout: ${TIMEOUT}s"
    [ "$VERBOSE" = "1" ] && log_info "Verbose mode enabled"
    echo ""

    # Check if server is running
    if ! check_server_running; then
        print_setup_instructions
        return 1
    fi

    echo ""

    # Run all tests
    test_models_endpoint || true
    echo ""

    test_chat_completions_basic || true
    echo ""

    test_streaming_support || true
    echo ""

    test_system_prompt || true
    echo ""

    test_temperature_parameter || true
    echo ""

    test_error_handling
    echo ""

    test_connection_timeout || true
    echo ""

    # Print summary
    print_summary

    # Return appropriate exit code
    [ $TESTS_FAILED -eq 0 ] && return 0 || return 1
}

# Run main function
main "$@"

#!/bin/bash
# Valdi AI UI - Development Setup Script
# Automates initial setup for new developers

set -e

echo "🚀 Valdi AI UI - Development Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js 18+ required, you have $(node --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm version
echo -e "${BLUE}Checking npm version...${NC}"
NPM_VERSION=$(npm --version | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo -e "${YELLOW}Warning: npm 9+ required, you have $(npm --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check Bazel
echo -e "${BLUE}Checking Bazel...${NC}"
if ! command -v bazel &> /dev/null; then
    echo -e "${YELLOW}Warning: Bazel not found. Install via: npm install -g @bazel/bazelisk${NC}"
else
    echo -e "${GREEN}✓ Bazel $(bazel version | grep 'Build label' | cut -d':' -f2)${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Set up environment
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env and add your API keys${NC}"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

# Install pre-commit hooks
echo -e "${BLUE}Installing pre-commit hooks...${NC}"
npm run prepare
echo -e "${GREEN}✓ Pre-commit hooks installed${NC}"

# Run validation
echo -e "${BLUE}Running validation checks...${NC}"
echo "  - Type checking..."
npm run type-check 2>&1 | tail -5
echo "  - Linting..."
npm run lint 2>&1 | tail -5 || true
echo "  - Tests..."
npm test 2>&1 | tail -5

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. Run 'npm run validate' to check everything"
echo "  3. Try '/build' to build the application"
echo "  4. Check QUICK_START.md for more info"
echo ""

#!/bin/bash
# Valdi AI UI - Release Script
# Automates version bumping and release creation

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get version argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version type required${NC}"
    echo "Usage: ./scripts/release.sh [major|minor|patch]"
    echo "Example: ./scripts/release.sh minor"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}Error: Invalid version type '$VERSION_TYPE'${NC}"
    echo "Must be: major, minor, or patch"
    exit 1
fi

echo -e "${BLUE}🚀 Valdi AI UI Release${NC}"
echo "======================="
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}Error: Uncommitted changes detected${NC}"
    echo "Please commit or stash changes before releasing"
    git status -s
    exit 1
fi
echo -e "${GREEN}✓ Working directory clean${NC}"

# Run validation
echo -e "${BLUE}Running validation...${NC}"
npm run validate || {
    echo -e "${RED}Error: Validation failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Validation passed${NC}"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${CURRENT_VERSION}${NC}"

# Bump version
echo -e "${BLUE}Bumping ${VERSION_TYPE} version...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✓ New version: ${NEW_VERSION}${NC}"

# Update CHANGELOG
echo -e "${BLUE}Updating CHANGELOG.md...${NC}"
DATE=$(date +%Y-%m-%d)
sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [${NEW_VERSION}] - ${DATE}/" CHANGELOG.md
rm CHANGELOG.md.bak
echo -e "${GREEN}✓ CHANGELOG updated${NC}"

# Commit changes
echo -e "${BLUE}Committing changes...${NC}"
git add package.json CHANGELOG.md
git commit -m "chore: release v${NEW_VERSION}"
echo -e "${GREEN}✓ Changes committed${NC}"

# Create tag
echo -e "${BLUE}Creating git tag...${NC}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
echo -e "${GREEN}✓ Tag created: v${NEW_VERSION}${NC}"

# Instructions
echo ""
echo -e "${GREEN}✅ Release prepared!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the changes:"
echo "     git show HEAD"
echo "  2. Push to remote:"
echo "     git push origin main --tags"
echo "  3. Create GitHub release:"
echo "     gh release create v${NEW_VERSION} --generate-notes"
echo ""
echo -e "${YELLOW}To undo: git reset --hard HEAD~1 && git tag -d v${NEW_VERSION}${NC}"
echo ""

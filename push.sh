#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   AuthorLab.ai - Quick Push Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./push.sh \"your commit message\"${NC}"
    echo -e "${YELLOW}Example: ./push.sh \"Added login page\"${NC}"
    exit 1
fi

COMMIT_MESSAGE="$1"

echo -e "${GREEN}📝 Staging changes...${NC}"
git add .

echo -e "${GREEN}💾 Committing: ${COMMIT_MESSAGE}${NC}"
git commit -m "$COMMIT_MESSAGE"

echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
git push

echo ""
echo -e "${GREEN}✅ Done! View at: https://github.com/SpikeIreland/authorslab-app${NC}"
echo -e "${BLUE}========================================${NC}"
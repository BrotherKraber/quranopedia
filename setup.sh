#!/bin/bash

# Quran Encyclopedia Installer
# For Linux and macOS

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${GREEN}       📖 Quran Encyclopedia Installer${NC}"
echo -e "${BLUE}====================================================${NC}\n"

# Step 1: Check Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 could not be found. Please install Python 3 first.${NC}"
    exit 1
fi

# Step 2: Create directory structure
echo -e "Creating local directories..."
mkdir -p "$HOME/.local/bin"
mkdir -p "$HOME/.local/share/quran"

# Step 3: Copy translation database if present
if [ -f "eng-ummmuhammad.json" ]; then
    echo -e "Installing local translation database (Sahih International)..."
    cp eng-ummmuhammad.json "$HOME/.local/share/quran/eng-ummmuhammad.json"
else
    echo -e "${YELLOW}Warning: eng-ummmuhammad.json not found in current directory.${NC}"
    echo -e "The CLI script will automatically download it on first run."
fi

# Step 4: Install the quran binary script
echo -e "Installing CLI script to ~/.local/bin/quran..."
if [ -f "quran" ]; then
    cp quran "$HOME/.local/bin/quran"
    chmod +x "$HOME/.local/bin/quran"
else
    echo -e "${RED}Error: CLI script 'quran' not found in current directory.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Core files installed successfully!${NC}\n"

# Step 5: Check if bin path is in $PATH
if [[ ":$PATH:" == *":$HOME/.local/bin:"* ]]; then
    echo -e "${GREEN}✓ ~/.local/bin is already in your PATH!${NC}"
    echo -e "You can run the app immediately by typing: ${BLUE}quran help${NC}"
else
    echo -e "${YELLOW}⚠️  Note: ~/.local/bin is not currently in your shell's PATH.${NC}"
    echo -e "To run 'quran' from anywhere, add it to your profile:"
    echo -e "  For Bash:  ${BLUE}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc && source ~/.bashrc${NC}"
    echo -e "  For Zsh:   ${BLUE}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc && source ~/.zshrc${NC}"
fi

echo -e "\n${BLUE}====================================================${NC}"
echo -e "To launch the interactive Web Portal, run:"
echo -e "  ${GREEN}python3 wiki/server.py${NC}"
echo -e "and open: ${BLUE}http://localhost:8000${NC}"
echo -e "${BLUE}====================================================${NC}"

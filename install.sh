#!/usr/bin/env bash
# Limitless Claude 8.5.0 - Automated Unix Installer (macOS & Linux)
# Usage: curl -fsSL https://raw.githubusercontent.com/mahik504/limitless-claude/master/install.sh | bash

set -e

echo "================================================================================"
echo "           LIMITLESS CLAUDE 8.5.0 - AUTOMATED UNIX INSTALLER"
echo "================================================================================"

# 1. Check Node.js
echo ""
echo "[1/5] Checking Node.js runtime..."
if ! command -v node >/dev/null 2>&1; then
    echo "[FAIL] Node.js is not installed."
    echo "Please install Node.js 22 or higher from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
    echo "[FAIL] Node.js version $NODE_VERSION detected. Node.js >= 22 is required."
    echo "Please upgrade Node.js from https://nodejs.org"
    exit 1
fi
echo "  -> Node.js version: $NODE_VERSION (OK)"

# 2. Check Git
echo ""
echo "[2/5] Checking Git version control..."
if ! command -v git >/dev/null 2>&1; then
    echo "[FAIL] Git is not installed. Please install git using your package manager."
    exit 1
fi
echo "  -> Git is available (OK)"

# 3. Setup Target Directory
echo ""
echo "[3/5] Setting up Limitless Claude repository..."
TARGET_DIR="${HOME}/limitless-claude"

if [ -d "$TARGET_DIR/.git" ]; then
    echo "  -> Existing repository found at $TARGET_DIR. Checking working tree..."
    if [ -n "$(git -C "$TARGET_DIR" status --porcelain)" ] && [ "$1" != "--force" ]; then
        echo "  [WARNING] Uncommitted changes detected in $TARGET_DIR."
        echo "  Refusing to overwrite dirty working tree. Please commit, stash, or pass --force."
        exit 1
    fi
    echo "  -> Pulling latest release via fast-forward..."
    git -C "$TARGET_DIR" fetch origin master
    git -C "$TARGET_DIR" pull --ff-only origin master || true
else
    echo "  -> Cloning Limitless Claude into $TARGET_DIR..."
    git clone https://github.com/mahik504/limitless-claude.git "$TARGET_DIR"
fi

# 4. Install Dependencies & Global Link
echo ""
echo "[4/5] Installing dependencies and registering 'limitless' global CLI..."
cd "$TARGET_DIR"
npm install --silent
npm link

# 5. Run Self-Healing Initialization Wizard
echo ""
echo "[5/5] Running Zero-Config Initialization Wizard..."
node bin/limitless.js init

echo ""
echo "================================================================================"
echo "  Limitless Claude 8.5.0 Installation Complete!"
echo "  Commands available from any terminal:"
echo "    limitless doctor      # System & gateway diagnostics"
echo "    limitless verify      # Live HTTP 200 connectivity check"
echo "    limitless pin --list  # Task-to-model pinning manager"
echo "    limitless launcher    # Start Claude Code with scoped profile"
echo "================================================================================"

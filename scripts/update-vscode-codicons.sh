#!/usr/bin/env zsh

# Script to copy codicon files from vscode-codicons to local vscode repo
# Usage: ./scripts/update-vscode-codicons.sh

# Define paths
CODICONS_REPO="$(cd "$(dirname "$0")" && pwd)"
VSCODE_REPO="../vscode"

# Ensure we're in the codicons repo
if [[ ! -f "$CODICONS_REPO/package.json" || ! -d "$CODICONS_REPO/src/icons" ]]; then
	echo "Error: Please run this script from the root of the vscode-codicons repository."
	exit 1
fi

# Check if vscode repo exists
if [[ ! -d "$VSCODE_REPO" ]]; then
	echo "Error: Could not find vscode repository at $VSCODE_REPO"
	exit 1
fi

# Check if required files exist
if [[ ! -f "$CODICONS_REPO/dist/codicon.ttf" || ! -f "$CODICONS_REPO/dist/codiconsLibrary.ts" ]]; then
	echo "Error: Required files not found in dist/ directory."
	echo "Please run 'npm run build' first to generate the required files."
	exit 1
fi

# Create target directories if they don't exist
mkdir -p "$VSCODE_REPO/src/vs/base/browser/ui/codicons/codicon"
mkdir -p "$VSCODE_REPO/src/vs/base/common"

# Copy files
echo "Copying codicon.ttf to vscode repository..."
cp "$CODICONS_REPO/dist/codicon.ttf" "$VSCODE_REPO/src/vs/base/browser/ui/codicons/codicon/"

echo "Copying codiconsLibrary.ts to vscode repository..."
cp "$CODICONS_REPO/dist/codiconsLibrary.ts" "$VSCODE_REPO/src/vs/base/common/"

echo "Done! Files have been successfully copied to the vscode repository."
echo "You may now commit these changes to your vscode repository."

#!/bin/bash
# Salambo hands sandbox template setup.

set -e

echo "=== Salambo Hands Sandbox Setup ==="
echo ""

echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   Node: $(node --version)"
else
    echo "   ERROR: Node.js 20+ is required for local template scripts."
    exit 1
fi

echo ""
echo "2. Installing dependencies..."
npm install

echo ""
echo "3. Validating sandbox image config..."
npm run sandbox:validate

echo ""
echo "4. Running tests..."
npm test

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Available commands:"
echo "  npm run sandbox:validate    - Validate sandbox-image/packages.mjs"
echo "  npm test                    - Run template tests"
echo "  npm run docker:build        - Build Docker image"
echo "  npm run compose:up          - Start local hands sandbox"

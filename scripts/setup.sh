#!/bin/sh

# Exit on any error
set -e

echo "🔧 Setting up IoT Agent Mesh development environment..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Verify critical dependencies are installed
echo "✅ Verifying installation..."
npx vitest --version > /dev/null || { echo "❌ Vitest installation failed"; exit 1; }

echo "🎉 Setup complete! You can now run tests with 'npm test'"

#!/bin/bash
# Limitless Claude Auto-Start Daemon for Linux / macOS

if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please install Node.js and npm."
    exit 1
fi

echo "Starting Limitless Claude (OmniRoute) in the background..."
nohup npx omniroute serve > omniroute.log 2>&1 &
PID=$!
echo "Daemon started with PID $PID."
echo "You can now run 'claude' in your terminal."

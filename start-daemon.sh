#!/bin/bash
# Limitless Claude Auto-Start Daemon for Linux / macOS

if ! command -v npx &> /dev/null && ! command -v omniroute &> /dev/null; then
    echo "Error: Neither 'omniroute' nor 'npx' was found in PATH."
    echo "Please ensure Node.js and npm are installed: https://nodejs.org/"
    exit 1
fi

CMD="npx omniroute"
if command -v omniroute &> /dev/null; then
    CMD="omniroute"
fi

echo "Starting Limitless Claude (OmniRoute) in the background..."
nohup $CMD serve > omniroute.log 2>&1 &
PID=$!
echo "Daemon started with PID $PID."
echo "Logs streaming to ./omniroute.log"
echo "You can now run 'claude' in your terminal."

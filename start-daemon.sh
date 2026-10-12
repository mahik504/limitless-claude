#!/bin/bash
# Limitless Claude Background Launcher for Linux / macOS
# Note: Launches OmniRoute in the background using nohup. It is not an auto-restarting service.

if command -v nc >/dev/null 2>&1 && nc -z 127.0.0.1 20128 2>/dev/null; then
    echo "OmniRoute gateway is already running and listening on port 20128."
    echo "You can now run 'claude' in your terminal."
    exit 0
fi

if ! command -v npx >/dev/null 2>&1 && ! command -v omniroute >/dev/null 2>&1; then
    echo "Error: Neither 'omniroute' nor 'npx' was found in PATH."
    echo "Please ensure Node.js and npm are installed: https://nodejs.org/"
    exit 1
fi

CMD="npx omniroute"
if command -v omniroute >/dev/null 2>&1; then
    CMD="omniroute"
fi

echo "Starting Limitless Claude (OmniRoute) in the background..."
nohup $CMD serve > omniroute.log 2>&1 &
PID=$!
echo "Daemon started with PID $PID."
echo "Logs streaming to ./omniroute.log"
echo "You can now run 'claude' in your terminal."

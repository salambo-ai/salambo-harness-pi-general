#!/bin/bash
# Start the API server (foreground) - v2.0.0

export PORT=${PORT:-3000}
export PI_HOME=${PI_HOME:-/home/node/.pi/agent}

mkdir -p "$PI_HOME"

if [ -d /app/harness-config/pi-agent-home ]; then
  cp -R -n /app/harness-config/pi-agent-home/. "$PI_HOME"/
fi

if [ ! -f "$PI_HOME/auth.json" ] && [ -f /tmp/pi-host-auth.json ]; then
  cp /tmp/pi-host-auth.json "$PI_HOME/auth.json"
fi

echo "Starting Agent API on port $PORT..."
node dist/src/server.js

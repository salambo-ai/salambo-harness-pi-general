#!/bin/bash
# Start the API server in the foreground.

export PORT=${PORT:-3000}
export PI_HOME=${PI_HOME:-/home/node/.pi/agent}

mkdir -p "$PI_HOME"

if [ -d /app/harness-config/pi-agent-home ]; then
  cp -R -n /app/harness-config/pi-agent-home/. "$PI_HOME"/
fi

if [ ! -f "$PI_HOME/auth.json" ] && [ -f /tmp/pi-host-auth.json ]; then
  cp /tmp/pi-host-auth.json "$PI_HOME/auth.json"
fi

if [ -n "${OPENAI_API_KEY:-}" ] && [ ! -f "$PI_HOME/auth.json" ]; then
  node -e 'const fs=require("fs"); const path=require("path"); const home=process.env.PI_HOME; const file=path.join(home,"auth.json"); fs.mkdirSync(home,{recursive:true}); fs.writeFileSync(file, JSON.stringify({ openai: { type: "api_key", key: process.env.OPENAI_API_KEY } }, null, 2));'
fi

if [ -n "${EGRESS_PROXY_CA_CERT_PEM_B64:-}" ] || [ -n "${EGRESS_PROXY_CA_CERT_PEM:-}" ]; then
  export SANDBOX_EGRESS_PROXY_CA_PATH="${NODE_EXTRA_CA_CERTS:-${REQUESTS_CA_BUNDLE:-${SSL_CERT_FILE:-/tmp/salambo-egress-proxy-ca.pem}}}"
  WRITTEN_CA_PATH=$(node -e '
const fs = require("fs");
const path = require("path");

const preferredPath = process.env.SANDBOX_EGRESS_PROXY_CA_PATH || "/tmp/salambo-egress-proxy-ca.pem";
const fallbackPath = "/tmp/salambo-egress-proxy-ca.pem";
const encoded = process.env.EGRESS_PROXY_CA_CERT_PEM_B64;
const raw = process.env.EGRESS_PROXY_CA_CERT_PEM;
const content = encoded ? Buffer.from(encoded, "base64").toString("utf8") : raw;

if (!content) {
  process.exit(1);
}

function writeCert(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(
    targetPath,
    content.endsWith("\n") ? content : `${content}\n`,
    "utf8",
  );
  return targetPath;
}

let finalPath;
try {
  finalPath = writeCert(preferredPath);
} catch (error) {
  finalPath = writeCert(fallbackPath);
}

process.stdout.write(finalPath);
')
  export NODE_EXTRA_CA_CERTS="$WRITTEN_CA_PATH"
  export REQUESTS_CA_BUNDLE="$WRITTEN_CA_PATH"
  export SSL_CERT_FILE="$WRITTEN_CA_PATH"
  unset EGRESS_PROXY_CA_CERT_PEM
  unset EGRESS_PROXY_CA_CERT_PEM_B64
fi

echo "Starting Agent API on port $PORT..."
node dist/src/server.js

#!/bin/bash
# Keep the hands-only sandbox alive for Salambo worker-controlled runs.

set -euo pipefail

export WORKSPACE_DIR=${WORKSPACE_DIR:-/workspace}

mkdir -p "$WORKSPACE_DIR" /run/salambo/extension-host

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

echo "Starting Salambo hands sandbox."
echo "  Workspace: $WORKSPACE_DIR"
echo "  Runtime:   /opt/salambo"
echo "  Run state: /run/salambo"
echo "  Brain:     worker-owned"

exec sleep infinity

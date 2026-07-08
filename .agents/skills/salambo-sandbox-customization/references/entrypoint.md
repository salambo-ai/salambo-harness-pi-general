# Entrypoint Guidance

Edit with care:

```text
sandbox/entrypoint.sh
```

The entrypoint is not an application server. It prepares the sandbox and keeps it alive so the Salambo worker can attach to it and control runs.

## Current responsibilities

The entrypoint currently:

1. Enables strict shell behavior:

   ```bash
   set -euo pipefail
   ```

2. Defines a stable workspace path:

   ```bash
   export WORKSPACE_DIR=${WORKSPACE_DIR:-/workspace}
   ```

3. Ensures required directories exist:

   ```bash
   mkdir -p "$WORKSPACE_DIR" /run/salambo/extension-host
   ```

4. Installs injected egress proxy CA certificates when Salambo provides them through env vars:

   ```text
   EGRESS_PROXY_CA_CERT_PEM_B64
   EGRESS_PROXY_CA_CERT_PEM
   ```

5. Exports standard CA env vars for Node/Python/OpenSSL clients:

   ```text
   NODE_EXTRA_CA_CERTS
   REQUESTS_CA_BUNDLE
   SSL_CERT_FILE
   ```

6. Unsets raw CA env vars after writing the certificate.

7. Prints startup diagnostics.

8. Keeps the sandbox process alive:

   ```bash
   exec sleep infinity
   ```

## Do not delete or casually change

| Entry | Why it matters |
| --- | --- |
| `WORKSPACE_DIR=${WORKSPACE_DIR:-/workspace}` | Gives runtime code a stable workspace default. |
| `/run/salambo/extension-host` creation | Hosted extension sidecar uses this path. |
| Egress CA handling block | Required when managed egress proxy injects a runtime CA. |
| `NODE_EXTRA_CA_CERTS`, `REQUESTS_CA_BUNDLE`, `SSL_CERT_FILE` exports | Makes Node, Python, and OpenSSL clients trust the injected egress CA. |
| `unset EGRESS_PROXY_CA_CERT_PEM*` | Avoids keeping raw cert payloads in environment longer than needed. |
| `exec sleep infinity` | Keeps the Daytona sandbox attachable for worker-owned runs. |

## Safe changes

- Add lightweight startup diagnostics.
- Create extra directories needed by your tools.
- Export non-secret defaults needed by your toolchain.
- Add checks that fail fast when required non-secret files are missing.

## Risky changes

- Starting a long-running app server as the main process.
- Removing `exec sleep infinity`.
- Deleting the egress CA block.
- Printing secrets or raw env vars.
- Changing `/run/salambo` paths.
- Assuming the agent brain runs inside this script.

## Architecture rule

Salambo's hosted worker owns the model loop and run lifecycle. The sandbox entrypoint should keep the sandbox ready for worker-controlled execution; it should not try to run the agent loop itself.

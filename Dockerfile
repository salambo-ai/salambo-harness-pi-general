# Inherit the Salambo-owned sandbox runtime so compatible runs can use
# the baked /opt/salambo extension sidecar instead of per-run injection.
FROM registry.depot.dev/94nv410m7k:salambo-sandbox-runtime-base-4a736563

WORKDIR /app

# Materialize sandbox image inputs. This template is hands-only: Salambo's
# worker owns the Pi brain/session/model loop, while this image provides tools,
# workspace files, resources, and hosted extension code.
COPY sandbox/packages.mjs ./sandbox/packages.mjs
COPY scripts/sandbox-config.mjs scripts/materialize-sandbox-config.mjs ./scripts/
RUN node scripts/materialize-sandbox-config.mjs /tmp/sandbox-config

# Install sandbox system packages.
RUN apt-get update && \
    grep -Ev '^\s*(#|$)' /tmp/sandbox-config/apt-packages.txt | xargs -r apt-get install -y && \
    rm -rf /var/lib/apt/lists/*

# Install optional global npm tools for hands-side execution.
RUN if grep -Eq '\S' /tmp/sandbox-config/npm-tools.txt; then \
      grep -Ev '^\s*(#|$)' /tmp/sandbox-config/npm-tools.txt | xargs -r npm install -g; \
    fi

# Run optional sandbox bootstrap script.
RUN sed -i 's/\r$//' /tmp/sandbox-config/bootstrap.sh && chmod +x /tmp/sandbox-config/bootstrap.sh && /tmp/sandbox-config/bootstrap.sh

# Create workspace and run-state directories.
# /workspace is the agent/customer hands area.
# /opt/salambo is inherited platform-owned baked runtime from the base image.
# /run/salambo is writable per-run platform state/override space.
RUN mkdir -p \
      /workspace \
      /run/salambo/extension-host && \
    chown -R node:node /workspace /run/salambo && \
    chmod 755 /opt/salambo /opt/salambo/extension-host && \
    chmod 700 /run/salambo /run/salambo/extension-host

# Create isolated Python environment (PEP 668 compliant).
RUN python3 -m venv /opt/pyenv
ENV PATH="/opt/pyenv/bin:${PATH}"

# Install Python packages for hands-side work.
RUN if grep -Eq '\S' /tmp/sandbox-config/requirements.txt; then \
      pip install --no-cache-dir -r /tmp/sandbox-config/requirements.txt; \
    fi

# Copy initial workspace files and sandbox-readable agent resources.
COPY --chown=node:node sandbox/workspace/ /workspace/
RUN mkdir -p /workspace/.salambo/agent
COPY --chown=node:node agent/skills /workspace/.salambo/agent/skills
COPY --chown=node:node agent/prompts /workspace/.salambo/agent/prompts
RUN mkdir -p /workspace/extensions
COPY --chown=node:node extensions /workspace/extensions
RUN chown -R node:node /workspace/.salambo /workspace/extensions

# Minimal sandbox entrypoint. The worker controls runs through Daytona exec/file APIs.
COPY sandbox/entrypoint.sh /app/sandbox/entrypoint.sh
RUN sed -i 's/\r$//' /app/sandbox/entrypoint.sh && chmod +x /app/sandbox/entrypoint.sh

USER node

ENV WORKSPACE_DIR=/workspace
ENV NODE_ENV=production

CMD ["/app/sandbox/entrypoint.sh"]

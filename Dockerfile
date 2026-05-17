# Inherit the Salambo-owned sandbox runtime so compatible runs can use
# the baked /opt/salambo extension sidecar instead of per-run injection.
FROM registry.depot.dev/94nv410m7k:salambo-sandbox-runtime-base-4a736563

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source + harness config for build
COPY src ./src
COPY harness-config ./harness-config
COPY scripts ./scripts
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Materialize docker build inputs from harness-config/docker.ts
RUN node --import tsx scripts/materialize-image-config.mjs /tmp/image-config

# Install harness system packages
RUN apt-get update && \
    grep -Ev '^\s*(#|$)' /tmp/image-config/apt-packages.txt | xargs -r apt-get install -y && \
    rm -rf /var/lib/apt/lists/*

# Install harness npm tools
RUN if grep -Eq '\S' /tmp/image-config/npm-tools.txt; then \
      grep -Ev '^\s*(#|$)' /tmp/image-config/npm-tools.txt | xargs -r npm install -g; \
    fi

# Install harness bootstrap script
RUN sed -i 's/\r$//' /tmp/image-config/bootstrap.sh && chmod +x /tmp/image-config/bootstrap.sh && /tmp/image-config/bootstrap.sh

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

# Create isolated Python environment (PEP 668 compliant)
RUN python3 -m venv /opt/pyenv
ENV PATH="/opt/pyenv/bin:${PATH}"

# Install Python packages
RUN if grep -Eq '\S' /tmp/image-config/requirements.txt; then \
      pip install --no-cache-dir -r /tmp/image-config/requirements.txt; \
    fi

# Copy initial workspace files and sandbox-readable agent resources
COPY --chown=node:node harness-config/initial-workspace/ /workspace/
RUN mkdir -p /workspace/.salambo/agent
COPY --chown=node:node agent/skills /workspace/.salambo/agent/skills
COPY --chown=node:node agent/prompts /workspace/.salambo/agent/prompts
RUN mkdir -p /workspace/.salambo/extensions
COPY --chown=node:node .salambo/extensions /workspace/.salambo/extensions
RUN chown -R node:node /workspace/.salambo

# Copy startup script
COPY start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

# Switch to non-root user
USER node

ENV WORKSPACE_DIR=/workspace
ENV PI_HOME=/home/node/.pi/agent
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["/app/start.sh"]

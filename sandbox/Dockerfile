# Inherit the Salambo-owned sandbox runtime so compatible runs can use
# the baked /opt/salambo extension sidecar instead of per-run injection.
FROM registry.depot.dev/94nv410m7k:salambo-sandbox-runtime-base-4a736563

WORKDIR /app

COPY sandbox/packages.mjs ./sandbox/packages.mjs

# Install sandbox system packages.
RUN apt-get update && \
    APT_PACKAGES="$(node -e "import('/app/sandbox/packages.mjs').then(({ default: config }) => console.log(config.apt.join(' ')))")" && \
    if [ -n "$APT_PACKAGES" ]; then apt-get install -y $APT_PACKAGES; fi && \
    rm -rf /var/lib/apt/lists/*

# Install optional global npm tools for hands-side execution.
RUN NPM_TOOLS="$(node -e "import('/app/sandbox/packages.mjs').then(({ default: config }) => console.log(config.npm.join(' ')))")" && \
    if [ -n "$NPM_TOOLS" ]; then npm install -g $NPM_TOOLS; fi

# Run optional sandbox bootstrap script.
RUN node -e "import('/app/sandbox/packages.mjs').then(({ default: config }) => process.stdout.write(config.setup))" > /tmp/salambo-sandbox-setup.sh && \
    if [ -s /tmp/salambo-sandbox-setup.sh ]; then sh /tmp/salambo-sandbox-setup.sh; fi && \
    rm -f /tmp/salambo-sandbox-setup.sh

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
RUN PIP_PACKAGES="$(node -e "import('/app/sandbox/packages.mjs').then(({ default: config }) => console.log(config.pip.join(' ')))")" && \
    if [ -n "$PIP_PACKAGES" ]; then pip install --no-cache-dir $PIP_PACKAGES; fi

# Copy initial workspace files and sandbox-readable agent resources.
COPY --chown=node:node sandbox/workspace/ /workspace/
RUN mkdir -p /workspace/.salambo/agent /workspace/agent/extensions
COPY --chown=node:node agent/skills /workspace/.salambo/agent/skills
COPY --chown=node:node agent/prompts /workspace/.salambo/agent/prompts
COPY --chown=node:node agent/extensions /workspace/agent/extensions
RUN chown -R node:node /workspace/.salambo /workspace/agent

COPY sandbox/entrypoint.sh /app/sandbox/entrypoint.sh
RUN sed -i 's/\r$//' /app/sandbox/entrypoint.sh && chmod +x /app/sandbox/entrypoint.sh

USER node

ENV WORKSPACE_DIR=/workspace
ENV NODE_ENV=production

CMD ["/app/sandbox/entrypoint.sh"]

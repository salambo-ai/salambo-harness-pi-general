# Inherit the Salambo-owned sandbox runtime so compatible runs can use
# the baked /opt/salambo extension sidecar instead of per-run injection.
FROM registry.depot.dev/94nv410m7k:salambo-sandbox-runtime-base-v2-570fc4dc

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
# /workspace is reserved for hands-side user work and outputs.
# Agent resources are platform-owned inputs under /opt/salambo/agent.
COPY --chown=node:node sandbox/workspace/ /workspace/
RUN mkdir -p /opt/salambo/agent/skills \
      /opt/salambo/agent/prompts \
      /opt/salambo/agent/extensions
COPY --chown=root:root agent/system.md /opt/salambo/agent/system.md
COPY --chown=root:root agent/settings.json /opt/salambo/agent/settings.json
COPY --chown=root:root agent/skills/ /opt/salambo/agent/skills/
COPY --chown=root:root agent/prompts/ /opt/salambo/agent/prompts/
COPY --chown=root:root agent/extensions/ /opt/salambo/agent/extensions/
RUN chmod -R u=rwX,go=rX /opt/salambo/agent

COPY sandbox/entrypoint.sh /app/sandbox/entrypoint.sh
RUN sed -i 's/\r$//' /app/sandbox/entrypoint.sh && chmod +x /app/sandbox/entrypoint.sh

USER node

ENV WORKSPACE_DIR=/workspace
ENV NODE_ENV=production

CMD ["/app/sandbox/entrypoint.sh"]

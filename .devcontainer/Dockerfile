# Dev Container for Riddle Rush Nuxt PWA
# Based on Node.js 20 with additional tools

FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install Node.js 20
ARG NODE_VERSION=20
RUN sudo apt-get update && sudo apt-get install -y curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - && \
    sudo apt-get install -y nodejs

# Install pnpm
RUN sudo npm install -g pnpm@latest

# Install additional dependencies
RUN sudo apt-get update && sudo apt-get install -y git make python3 python3-pip python3-venv \
    openjdk-17-jdk && \
    sudo apt-get clean -y && \
    sudo rm -rf /var/lib/apt/lists/*

RUN npx -y playwright@1.58.0 install --with-deps
RUN npx playwright install --with-deps chromium



# Set up the non-root user
RUN sudo chown -R node:node /workspace

# Install Turbo
RUN sudo npm install -g turbo@latest

# Set the working directory
WORKDIR /workspace

# Use bash as the default shell
SHELL ["/bin/bash"]

# Install recommended extensions
RUN sudo npm install -g @vue/cli @nuxt/cli @capacitor/cli

# Set environment variables
ENV NODE_ENV=development
ENV PNPM_HOME=/home/node/.pnpm
ENV PATH="$PNPM_HOME:$PATH"

# Create a symlink for pnpm
RUN ln -s /usr/local/bin/pnpm /usr/local/bin/pnpm
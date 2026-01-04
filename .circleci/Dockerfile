# CircleCI Custom Docker Image
# Based on cimg/node with pre-installed tools for faster builds
#
# This image includes:
# - Node.js 20.19.0
# - pnpm (via corepack)
# - AWS CLI v2
# - Terraform
# - Common build dependencies
#
# Build and push:
#   docker build -t yourusername/riddle-rush-ci:latest -f .circleci/Dockerfile .
#   docker push yourusername/riddle-rush-ci:latest

FROM cimg/node:20.19.0

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    COREPACK_HOME=/home/circleci/.corepack \
    PNPM_HOME=/home/circleci/.local/share/pnpm \
    PATH=/home/circleci/.local/share/pnpm:/home/circleci/.corepack/bin:$PATH

# Switch to root for installations
USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    wget \
    gnupg \
    software-properties-common \
    lsb-release \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip \
    && aws --version

# Install Terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    tee /etc/apt/sources.list.d/hashicorp.list \
    && apt-get update \
    && apt-get install -y terraform \
    && rm -rf /var/lib/apt/lists/* \
    && terraform version

# Switch back to circleci user
USER circleci

# Setup pnpm via corepack
# Skip 'corepack enable' to avoid permission errors (no system-wide installation needed)
# Just prepare pnpm to user cache directory
RUN mkdir -p ${COREPACK_HOME} ${PNPM_HOME} \
    && corepack prepare pnpm@10.27.0 --activate \
    && corepack pnpm --version

# Verify installations
RUN echo "=== Installed Tools ===" \
    && node --version \
    && npm --version \
    && corepack pnpm --version \
    && aws --version \
    && terraform version

# Set working directory
WORKDIR /home/circleci/project

# Add labels
LABEL maintainer="riddle-rush-team" \
      description="Custom CircleCI image with Node.js, pnpm, AWS CLI, and Terraform" \
      version="1.0.0"

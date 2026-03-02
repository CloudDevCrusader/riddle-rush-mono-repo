#!/bin/bash
set -e

# Update all packages
dnf update -y

# Install and start Docker
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Install Docker Compose plugin
curl -SL "https://github.com/docker/compose/releases/download/${docker_compose_version}/docker-compose-linux-aarch64" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Install and start Caddy
dnf install -y 'dnf-command(copr)'
dnf copr enable -y @caddy/caddy
dnf install -y caddy
systemctl enable caddy
systemctl start caddy

# Create directories for Tolgee
mkdir -p /opt/tolgee/data

# Create docker-compose.yml for Tolgee
cat > /opt/tolgee/docker-compose.yml <<EOF
version: '3.8'
services:
  tolgee:
    image: tolgee/tolgee:latest
    container_name: tolgee
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - ./data:/data
    environment:
      - TOLGEE_AUTHENTICATION_ENABLED=true
      - TOLGEE_AUTHENTICATION_INITIAL_USERNAME=admin
      - TOLGEE_AUTHENTICATION_INITIAL_PASSWORD=${tolgee_admin_password}
EOF

# Create Caddyfile
cat > /etc/caddy/Caddyfile <<EOF
${domain_name} {
    reverse_proxy localhost:8080
}
EOF

# Reload Caddy to apply the new config
systemctl reload caddy

# Start Tolgee using Docker Compose
docker compose -f /opt/tolgee/docker-compose.yml up -d

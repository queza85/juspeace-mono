#!/usr/bin/env bash
# bootstrap-amazon-linux.sh — Juspeace Amazon Linux 2023 host prerequisites
#
# Installs what the host needs before `docker compose up --build`.
# Postgres, Mailpit, Node 22, and pnpm 10.22.0 run inside Compose images;
# they are not required on the host unless MODE=native or MODE=all.
#
# Usage:
#   sudo ./scripts/bootstrap-amazon-linux.sh
#   sudo MODE=native ./scripts/bootstrap-amazon-linux.sh
#   sudo MODE=all ./scripts/bootstrap-amazon-linux.sh
set -euo pipefail

MODE="${MODE:-docker}"
NODE_MAJOR="22"
PNPM_VERSION="10.22.0"
COMPOSE_PLUGIN_DIR="/usr/libexec/docker/cli-plugins"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

need_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "Run as root: sudo $0" >&2
    exit 1
  fi
}

assert_amazon_linux_2023() {
  # shellcheck source=/dev/null
  . /etc/os-release
  if [[ "${ID}" != "amzn" ]]; then
    echo "This script supports Amazon Linux only (found: ${ID})" >&2
    exit 1
  fi
  if [[ "${VERSION_ID}" != 2023* ]]; then
    echo "This script supports Amazon Linux 2023 (found: ${PRETTY_NAME:-Amazon Linux ${VERSION_ID}})" >&2
    exit 1
  fi
  log "${PRETTY_NAME:-Amazon Linux ${VERSION_ID}}"
}

node_major() {
  if ! command -v node >/dev/null 2>&1; then
    echo "0"
    return
  fi
  node -p "process.versions.node.split('.')[0]"
}

install_base() {
  log "Installing base packages"
  dnf install -y ca-certificates curl gnupg2 git tar
}

compose_available() {
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1
}

install_compose_plugin() {
  if dnf install -y docker-compose-plugin >/dev/null 2>&1 && compose_available; then
    log "Installed docker-compose-plugin from Amazon Linux repos"
    return
  fi

  log "Installing Docker Compose v2 plugin from GitHub (not in Amazon Linux repos)"
  mkdir -p "${COMPOSE_PLUGIN_DIR}"
  local arch
  arch="$(uname -m)"
  curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${arch}" \
    -o "${COMPOSE_PLUGIN_DIR}/docker-compose"
  chmod +x "${COMPOSE_PLUGIN_DIR}/docker-compose"
}

install_docker() {
  if compose_available; then
    log "Docker + Compose already installed: $(docker --version)"
  else
    log "Installing Docker from Amazon Linux repos"
    dnf install -y docker
    install_compose_plugin
  fi

  systemctl enable --now docker

  if ! compose_available; then
    echo "docker compose is not available after install" >&2
    exit 1
  fi

  local target_user="${SUDO_USER:-}"
  if [[ -n "${target_user}" && "${target_user}" != "root" ]]; then
    usermod -aG docker "${target_user}"
    log "Added ${target_user} to docker group (log out and back in, or: newgrp docker)"
  fi
}

install_node_pnpm() {
  local major
  major="$(node_major)"
  if [[ "${major}" -lt "${NODE_MAJOR}" ]]; then
    log "Installing Node.js ${NODE_MAJOR} from NodeSource"
    curl -fsSL "https://rpm.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    dnf install -y nodejs
  else
    log "Node already installed: $(node -v)"
  fi

  corepack enable
  corepack prepare "pnpm@${PNPM_VERSION}" --activate
  log "Node $(node -v), pnpm $(pnpm -v)"
}

install_native_build_deps() {
  log "Installing native module build deps (bcrypt / Prisma)"
  dnf install -y gcc gcc-c++ make python3 openssl openssl-devel
}

print_next_steps() {
  cat <<'EOF'

Prerequisites installed.

Run the stack with Docker Compose (same path as Jenkins):

  cd /path/to/juspeace-mono
  cp .env.example .env
  cp juspeace-be/.env.example juspeace-be/.env
  cp juspeace-fe/.env.example juspeace-fe/.env.local
  cp juspeace-admin-fe/.env.example juspeace-admin-fe/.env.local

  # Production: replace localhost with public URLs
  #   .env                    NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
  #   juspeace-be/.env        CORS_ORIGINS=https://shop.example.com,https://admin.example.com
  #   juspeace-fe/.env.local  NEXT_PUBLIC_API_URL (same as above)
  #   juspeace-admin-fe/.env.local  NEXT_PUBLIC_API_URL (same as above)

  docker compose up --build -d

Open:
  storefront  http://<host>:3000
  admin       http://<host>:3001
  API health  http://<host>:7777/api/v1/health
  Swagger     http://<host>:7777/docs

If you were added to the docker group, log out and back in (or: newgrp docker).
Do not expose Postgres (5432) or Mailpit (1025/8025) on the public internet.
EOF
}

need_root
assert_amazon_linux_2023
install_base

case "${MODE}" in
  docker)
    install_docker
    ;;
  native)
    install_node_pnpm
    install_native_build_deps
    ;;
  all)
    install_docker
    install_node_pnpm
    install_native_build_deps
    ;;
  *)
    echo "Unknown MODE=${MODE} (use docker | native | all)" >&2
    exit 1
    ;;
esac

log "Done"
docker --version 2>/dev/null || true
docker compose version 2>/dev/null || true
node -v 2>/dev/null || true
pnpm -v 2>/dev/null || true
print_next_steps

#!/bin/bash
set -e

# Backup installation folder
# Usage: ./scripts/backup-installation.sh [installation-name]

INSTALLATION_NAME="${1:-one-group}"
BACKUP_DIR="backups/installations"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${INSTALLATION_NAME}-${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

if [ -d "/${INSTALLATION_NAME}" ]; then
  echo "📦 Backing up installation: ${INSTALLATION_NAME}"
  tar -czf "${BACKUP_PATH}" "/${INSTALLATION_NAME}"
  echo "✅ Backup created: ${BACKUP_PATH}"

  # Keep only last 10 backups
  ls -t "${BACKUP_DIR}/${INSTALLATION_NAME}"-*.tar.gz | tail -n +11 | xargs -r rm
  echo "🧹 Cleaned up old backups (keeping last 10)"
else
  echo "❌ Installation folder not found: /${INSTALLATION_NAME}"
  exit 1
fi

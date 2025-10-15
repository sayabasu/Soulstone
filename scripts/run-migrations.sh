#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${MIGRATION_COMMAND:-}" ]]; then
  echo "MIGRATION_COMMAND not set. Skipping database migrations."
  exit 0
fi

echo "Running database migrations using command: ${MIGRATION_COMMAND}" >&2
bash -lc "${MIGRATION_COMMAND}"

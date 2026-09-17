#!/usr/bin/env bash
# Falha se algum arquivo dentro de uma pasta/arquivo protegido foi removido entre
# BASE_REF e HEAD_REF. Motivo de existir: a PR #52 apagou por engano as migrations
# V1/V2 do Flyway num merge, e isso só foi notado bem depois, manualmente.
#
# Uso: scripts/check-protected-paths.sh [BASE_REF] [HEAD_REF]
#   BASE_REF padrão: origin/develop
#   HEAD_REF padrão: HEAD
set -euo pipefail

PROTECTED_PATHS=(
  "codigo-fonte/backend/src/main/resources/db/migration"
  "docker-compose.yml"
  ".github/workflows"
)

BASE_REF="${1:-origin/develop}"
HEAD_REF="${2:-HEAD}"

echo "Verificando remoção de arquivos em pastas protegidas entre $BASE_REF e $HEAD_REF..."
echo "Pastas/arquivos protegidos:"
printf '  - %s\n' "${PROTECTED_PATHS[@]}"
echo

deleted_files=$(git diff --name-status --diff-filter=D "$BASE_REF" "$HEAD_REF" -- "${PROTECTED_PATHS[@]}" || true)

if [ -n "$deleted_files" ]; then
  echo "ERRO: os arquivos abaixo foram removidos em pastas protegidas:"
  echo "$deleted_files"
  echo
  echo "Se a remoção for intencional, ajuste PROTECTED_PATHS neste script ou explique o motivo na PR."
  exit 1
fi

echo "Nenhum arquivo removido em pastas protegidas."

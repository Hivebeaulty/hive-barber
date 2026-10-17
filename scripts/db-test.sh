#!/usr/bin/env bash
# Aplica as migrações em um banco DESCARTÁVEL (Postgres puro + stub do Supabase) e
# roda os testes SQL. NUNCA aponte para um banco real: o script recria o banco.
#
# Uso:
#   PGHOST=localhost PGUSER=postgres bash scripts/db-test.sh
# Variáveis: PGHOST, PGPORT, PGUSER, PGPASSWORD (padrão do libpq) e
#            DB_TEST_NAME (padrão: bolonha_test).
set -euo pipefail

cd "$(dirname "$0")/.."
DB="${DB_TEST_NAME:-bolonha_test}"

case "$DB" in
  *test*|*tmp*|*scratch*) ;;
  *) echo "Recusado: DB_TEST_NAME deve conter 'test', 'tmp' ou 'scratch' (recebido: $DB)." >&2; exit 2 ;;
esac

PSQL=(psql -v ON_ERROR_STOP=1 -q)

"${PSQL[@]}" -d postgres -c "drop database if exists \"$DB\"" -c "create database \"$DB\""
# Imita o search_path do Supabase (inclui "extensions", onde ficam as extensões).
"${PSQL[@]}" -d postgres -c "alter database \"$DB\" set search_path = \"\$user\", public, extensions"
"${PSQL[@]}" -d "$DB" -f supabase/tests/support/supabase_stub.sql

for f in supabase/migrations/*.sql; do
  echo "aplicando $f"
  "${PSQL[@]}" -d "$DB" -f "$f"
done

for t in supabase/tests/*.test.sql; do
  echo "testando $t"
  "${PSQL[@]}" -d "$DB" -f "$t"
done

echo "Testes de banco concluídos sem erro."

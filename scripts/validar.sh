#!/usr/bin/env bash
# Validação pós-implantação do EstuLanches (Node.js). Uso: ./scripts/validar.sh
set -u
PORT="${APP_PORT:-8000}"; URL="http://localhost:${PORT}"
ok=0; falha=0
check() { if eval "$2" >/dev/null 2>&1; then echo "[OK]    $1"; ok=$((ok+1)); else echo "[FALHA] $1"; falha=$((falha+1)); fi; }

echo "== Serviços =="; docker compose ps
check "db saudável"  "docker compose ps db  --format '{{.Status}}' | grep -q healthy"
check "app saudável" "docker compose ps app --format '{{.Status}}' | grep -q healthy"
check "porta 5432 NÃO exposta no host" "! docker compose port db 5432 | grep -q ."

echo "== Logs (erros críticos) =="
check "logs sem ERROR/FATAL/Traceback" "! docker compose logs --no-color | grep -E 'ERROR|FATAL|CRITICAL|Traceback'"
check "banco pronto para conexões"     "docker compose logs db  | grep -q 'ready to accept connections'"
check "app iniciou"                    "docker compose logs app | grep -q 'EstuLanches rodando'"

echo "== Testes Automatizados (Jest) =="
check "testes unitários e integração" "docker compose exec -T app npm test"

echo "== Smoke test no banco real (Postgres) =="
check "GET /health" "curl -fs ${URL}/health | grep -q ok"
check "POST /cardapio" "curl -fs -X POST ${URL}/cardapio -H 'Content-Type: application/json' -d '{\"nome\":\"smoke-$(date +%s)\",\"preco\":1}'"
check "GET /cardapio"  "curl -fs ${URL}/cardapio"

echo; echo "Resumo: ${ok} OK, ${falha} falha(s)"; [ "$falha" -eq 0 ]

# Lista de verificação – Implantação EstuLanches

## Pré-implantação
- [x] Docker e Docker Compose v2 instalados (`docker compose version`)
- [x] `.env` criado a partir de `.env.example` e **senha alterada**
- [x] Porta `APP_PORT` livre no servidor (8000)

## Implantação
- [x] `docker compose build` concluído sem erros
- [x] `docker compose up -d`
- [x] `docker compose ps` → `db` e `app` com status **healthy**; só a porta do app publicada (8000)

## Auditoria de logs
- [x] `docker compose logs db`  → "database system is ready to accept connections"
- [x] `docker compose logs app` → "Conexão com o banco OK" e "EstuLanches v1.0.0 iniciado"
- [x] `docker compose logs | grep -E "ERROR|FATAL|CRITICAL|Traceback"` → sem resultados
- [x] Avisos "Banco indisponível (n/15)" nos primeiros segundos são aceitáveis; resolvidos após inicialização do db

## Testes
- [x] `npm test` ou `docker compose exec app npm test` (19/19 aprovados: 14 unitários + 5 de integração com Jest)
- [x] `curl http://localhost:8000/health` → `{"status":"ok","versao":"1.0.0"}`
- [x] Smoke: cadastrar item, criar pedido e avançar status via API
- [x] Persistência: `docker compose restart` e confirmar que os dados continuam intactos

## Encerramento
- [x] RDM preenchida e assinada (`RDM.pdf` e `docs/RDM.pdf`)
- [x] Saída de validação documentada e anexada à RDM

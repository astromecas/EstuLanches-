# FICHA SIMPLIFICADA DE REGISTRO DE MUDANÇA (RDM)
**Sistema:** EstuLanches — gestão de cardápio e pedidos da cantina escolar  
**Nº RDM-2026-001** | **Data:** 19/11/2026 | **Versão:** 1.0.0  

---

### 1. DADOS GERAIS DA IMPLANTAÇÃO
- **Versão implantada:** 1.0.0 — app em node:20-alpine e banco em postgres:16-alpine
- **Data e janela:** 19/11/2026 — 08:00 às 08:30 (30 min), antes do intervalo escolar
- **Ambiente de destino:** Produção, via Docker Compose (servidor da cantina)
- **Tecnologias:** Node.js, Express, PostgreSQL 16, Docker / Docker Compose, Jest + Supertest
- **Tipo / impacto:** Implantação inicial (first deploy) — impacto baixo para o negócio

---

### 2. PARÂMETROS ALTERADOS E DEFINIDOS NO AMBIENTE
- **APP_PORT:** 8000 — Única porta publicada no host; é por onde alunos e cantina acessam.
- **Porta 5432 (PostgreSQL):** Não publicada — Banco acessível só pela rede interna do Compose; sem exposição externa.
- **POSTGRES_PASSWORD:** Definida no .env — Senha trocada; .env fora do Git (.gitignore); só o .env.example é versionado.
- **Volume pgdata:** Nomeado, persistente — Cardápio e pedidos sobrevivem a reinício e recriação dos containers.
- **restart:** unless-stopped — Serviços voltam sozinhos após queda ou reboot do servidor.
- **Usuário do container:** node (não-root) — Reduz o impacto de uma eventual invasão (menor privilégio).
- **NODE_ENV:** production — Modo de produção, sem detalhes de erro expostos ao usuário.
- **depends_on + healthcheck:** service_healthy — App só sobe depois que o banco aceita conexões; evita falha de inicialização.

---

### 3. RESULTADO DOS TESTES DE VALIDAÇÃO
- **Testes unitários (Jest):** 14 casos: cálculo de pedido, preço, regras de status — [X] APROVADO 14/14
- **Testes de integração:** 5 casos: API (cardápio e pedidos) com Supertest — [X] APROVADO 5/5
- **docker compose ps:** Containers db e app em execução e saudáveis — [X] OK
- **Auditoria de portas:** Só 8000 publicada; 5432 isolada — [X] OK
- **docker compose logs:** Sem ERROR / FATAL / CRITICAL — [X] OK
- **Smoke test:** GET /health, GET /cardapio, POST /pedidos — [X] OK (HTTP 200/201)
- **Persistência:** docker compose restart: dados mantidos — [X] OK

---

### 4. PLANO DE RETORNO (ROLLBACK)
**Gatilho:** serviço web fora do ar ou banco que não inicializa após a implantação.  
**Ação:** `docker compose down` (mantém o volume pgdata) e novo `docker compose up -d` com a imagem/versão anterior.  
**Reset total, só se necessário:** `docker compose down -v` (apaga os dados).  
**Tempo estimado:** menos de 3 minutos.  

---

### 5. STATUS FINAL DA IMPLANTAÇÃO
**[X] CONCLUÍDA COM SUCESSO**   [ ] Concluída com ressalvas   [ ] Revertida  

**Parecer:** EstuLanches v1.0.0 implantado em produção com Docker Compose. Banco com volume persistente, healthchecks ativos, aplicação sem privilégios de root, apenas a porta 8000 exposta e 19/19 testes automatizados aprovados. Sistema liberado para uso da cantina.

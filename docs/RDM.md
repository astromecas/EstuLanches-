# 📋 FICHA SIMPLIFICADA DE REGISTRO DE MUDANÇA (RDM)

> **Sistema:** EstuLanches — Gestão de Cardápio e Pedidos da Cantina Escolar  
> **Nº da RDM:** `RDM-2026-001` &nbsp;|&nbsp; **Responsável:** Técnico de Implantação  
> **Classificação:** Mudança Padrão / Implantação Inicial em Produção (Stack: Node.js / Express / PostgreSQL)

---

### 1. Dados Gerais da Implantação

| Parâmetro | Detalhes do Ambiente |
|:---|:---|
| **Versão Implantada** | `v1.0.0` (Container App: `node:20-alpine` \| Banco: `postgres:16-alpine`) |
| **Data e Horário** | **18/11/2026** — Janela: **08:00** às **08:30** (Duração: 30 min) |
| **Ambiente de Destino** | **Produção** via Docker Compose (Cluster local / Servidor da Cantina) |
| **Tecnologias Utilizadas** | **Node.js, Express.js, PostgreSQL 16, Jest (Testes)** |
| **Tipo de Mudança** | Implantação Inicial (First Deploy) |
| **Impacto no Negócio** | Baixo (Janela planejada antes do intervalo escolar) |

---

### 2. Parâmetros Alterados e Configurações de Produção

| Parâmetro / Recurso | Configuração Aplicada | Justificativa / Política de Segurança |
|:---|:---:|:---|
| **Porta da Aplicação (`APP_PORT`)** | `8000:8000` | Única porta pública mapeada para o host. |
| **Porta do Banco (5432)** | **Não publicada** | Protegida na rede interna privada (`interna`), inacessível externamente. |
| **Credenciais de Acesso** | Definidas via `.env` | Credenciais fortes isoladas do versionamento Git via `.gitignore`. |
| **Persistência de Dados** | Volume `pgdata` | Garante integridade do banco relacional entre recriações de containers. |
| **Política de Recuperação** | `unless-stopped` | Reinício automático em caso de reinicialização do servidor ou falha. |
| **Privilégios no Container** | Usuário `node` | Execução não-root padrão Alpine em conformidade com DevSecOps. |
| **Variáveis de Ambiente**| `NODE_ENV=production` | Modo de alta performance sem vazamento de stack traces em produção. |

---

### 3. Resultado dos Testes de Validação

| Etapa de Validação | Critério Avaliado | Resultado |
|:---|:---|:---:|
| **Testes Unitários (Jest)** | 14 casos de teste (`npm run test:unit`) — Lógica de negócio e cálculos puros | **[X] APROVADO** (14/14) |
| **Testes de Integração (Supertest)**| 5 casos de teste (`npm run test:integration`) — Fluxos API Express + Banco | **[X] APROVADO** (5/5) |
| **Estado dos Serviços** | `docker compose ps` — Verificação de *healthstatus* dos containers | **[X] OK** (Serviços saudáveis) |
| **Auditoria de Portas** | Verificação de isolamento da porta 5432 e abertura exclusiva da 8000 | **[X] OK** (Isolamento confirmado) |
| **Auditoria de Logs** | `docker compose logs` — Ausência de `ERROR`, `FATAL` ou falhas críticas | **[X] OK** (Logs limpos) |
| **Smoke Test Operacional**| Verificação de endpoints `/health`, `/cardapio` e `/pedidos` | **[X] OK** (HTTP 200/201) |

> **Nota:** Todos os 19 testes automatizados foram executados e validados com 100% de sucesso via Jest.

---

### 4. Plano de Contingência e Retorno (Rollback)

* **Critério de Acionamento:** Inoperância do serviço web ou corrupção na inicialização do PostgreSQL.
* **Procedimento:** Executar `docker compose down` mantendo o volume `pgdata` intacto. Em caso de necessidade de reset da instalação inicial, executar `docker compose down -v`. Tempo estimado de recuperação: < 3 minutos.

---

### 5. Parecer e Status Final da Implantação

**Status Oficial:**
- [X] **CONCLUÍDA COM SUCESSO**
- [ ] Concluída com ressalvas
- [ ] Revertida (Rollback executado)

> **Observações do Técnico:**  
> A implantação do sistema EstuLanches v1.0.0 (Node.js/Express) foi concluída com êxito. O banco de dados PostgreSQL foi provisionado com volume persistente, os healthchecks confirmaram a disponibilidade dos serviços, a interface web moderna e os testes automatizados foram validados com 100% de taxa de sucesso. Sistema liberado para operação da cantina escolar.

---

### 6. Assinaturas e Aprovações

| Responsabilidade | Nome / Função | Assinatura | Data |
|:---|:---|:---:|:---:|
| **Executor** | Técnico de Implantação | *Assinado digitalmente* | 18/11/2026 |
| **Aprovador** | Gestão de Infraestrutura e TI | *Aprovado* | 18/11/2026 |

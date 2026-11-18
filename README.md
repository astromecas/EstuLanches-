# EstuLanches (Node.js & Express)

Sistema de gestão de cardápio e pedidos da cantina escolar conteinerizado com Docker e banco relacional PostgreSQL.

## Tecnologias
- **Backend:** Node.js & Express.js
- **Banco de Dados:** PostgreSQL 16
- **Testes Automatizados:** Jest & Supertest
- **Conteinerização:** Docker & Docker Compose

## Como rodar localmente (Desenvolvimento)
```bash
npm install
npm run dev
```
Acesse no navegador: `http://localhost:8000`

## Como rodar os Testes Automatizados (Jest)
```bash
# Todos os testes (14 unitários + 5 integração)
npm test

# Apenas unitários
npm run test:unit

# Apenas integração
npm run test:integration
```

## Como subir em Produção com Docker
```bash
# 1. Subir os containers (app e banco de dados)
docker compose up -d --build

# 2. Verificar estado dos serviços e portas ativas
docker compose ps

# 3. Auditar logs de inicialização
docker compose logs

# 4. Validar implantação automaticamente
# Linux/macOS:
./scripts/validar.sh

# Windows (PowerShell):
.\scripts\validar.ps1
```

## Endpoints da API
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Saúde da aplicação e conexão com o banco |
| GET | `/cardapio` | Listar itens do cardápio (`?disponivel=true`) |
| POST | `/cardapio` | Cadastrar novo item |
| PATCH | `/cardapio/:id` | Alterar preço ou disponibilidade |
| GET | `/pedidos` | Listar todos os pedidos da cantina |
| POST | `/pedidos` | Criar pedido do aluno |
| GET | `/pedidos/:id` | Consultar pedido específico |
| PATCH | `/pedidos/:id/status` | Avançar status (recebido → em_preparo → pronto → entregue) |

# Roteiro Completo para Gravação do Vídeo (2 a 5 minutos)
**Atividade:** Técnico de Implantação – Sistema EstuLanches  
**Stack Oficial:** Node.js, Express, PostgreSQL, Jest e Docker  

---

## ⏱️ Distribuição de Tempo Sugerida (Total: ~3 min e 30 seg)
- **00:00 - 00:30** | 1. Apresentação Pessoal e Objetivo do Projeto
- **00:30 - 01:10** | 2. Explicação do Dockerfile e Docker Compose
- **01:10 - 01:45** | 3. Demonstração do Código e Testes Automatizados (Jest)
- **01:45 - 02:30** | 4. Demonstração Prática do Sistema em Operação
- **02:30 - 02:55** | 5. Exibição da Ficha RDM (Registro de Mudança)
- **02:55 - 03:20** | 6. Segurança da Aplicação (DevSecOps)
- **03:20 - 03:50** | 7. Escalabilidade Nacional (1 Milhão de Usuários / 100k Simultâneos)
- **03:50 - 04:00** | Encerramento

---

## 🎬 Fala Passo a Passo (O que dizer e o que mostrar na tela)

### 1. Apresentação (30 segundos)
> **O que mostrar:** Sua webcam ou tela inicial do projeto com o VS Code aberto.  
> **O que falar:**  
> *"Olá professor e avaliadores! Meu nome é [SEU NOME] e atuo como Técnico de Implantação neste projeto. Vou apresentar a implantação em produção do **EstuLanches**, um sistema desenvolvido em **Node.js, Express e PostgreSQL**conteinerizado com **Docker**. O sistema resolve o problema das filas e lentidão no recreio escolar, permitindo que os alunos consultem o cardápio em tempo real e façam pedidos na cantina com acompanhamento de status."*

---

### 2. Dockerfile e Docker Compose (40 segundos)
> **O que mostrar:** Abrir o arquivo `Dockerfile` e depois o `docker-compose.yml` no VS Code.  
> **O que falar:**  
> *"Aqui no **Dockerfile**, utilizamos a imagem base leve `node:20-alpine`. Como boa prática de segurança DevSecOps, não rodamos como root: criamos o usuário restrito `USER node`. O Dockerfile também inclui um `HEALTHCHECK` que valida a cada 15 segundos se a rota `/health` está respondendo.*  
> *Já no **docker-compose.yml**, orquestramos dois serviços: o **app** Node.js na porta 8000 e o banco **db** com PostgreSQL 16. Destaco três decisões importantes de arquitetura:*  
> *1) A porta 5432 do banco **não** é exposta publicamente na internet, ficando isolada na rede interna;*  
> *2) Usamos um volume nomeado `pgdata` para persistência dos dados;*  
> *3) O app possui `depends_on` com condição `service_healthy`, garantindo que o servidor só suba após o banco estar pronto para receber conexões."*

---

### 3. Código e Testes Automatizados (35 segundos)
> **O que mostrar:** Abrir o terminal no VS Code e rodar o comando: `npm test`  
> **O que falar:**  
> *"Na arquitetura do código em Node.js, separamos as regras puras de negócio no `services.js`, o pool de conexão resiliente no `db.js` e as rotas Express no `routes.js`.*  
> *Para garantir qualidade e ausência de falhas, criamos uma suíte completa de **19 testes automatizados com Jest**: são 14 testes unitários cobrindo cálculos de pedidos, validações de preço e máquina de estados, e 5 testes de integração com Supertest validando os endpoints REST. Como podem ver no terminal, todos os 19 testes passaram com 100% de sucesso."*

---

### 4. Demonstração do Sistema em Operação (45 segundos)
> **O que mostrar:** Navegador aberto em `http://localhost:8000`  
> **O que falar:**  
> *"Agora vamos ao sistema em funcionamento no navegador:*  
> *- Aqui temos a interface da cantina escolar, com fotos reais dos lanches do recreio: Pão de Queijo artesanal quentinho, Suco Natural de Laranja, Coxinha de Frango e Bolo de Cenoura com Chocolate.*  
> *- Posso filtrar por categorias: Salgados, Bebidas e Doces.*  
> *- Ao clicar em '+ Pedir', o item vai para a Comanda do Aluno. Vou informar o aluno 'Lucas Mendes (8º B)' e confirmar o pedido.*  
> *- Na seção da Cantina, o pedido já aparece na fila como 'Recebido'. O cantineiro pode avançar para 'Em preparo', depois 'Pronto' e finalmente 'Entregue', atualizando no banco de dados."*

---

### 5. Exibição da Ficha RDM em PDF (25 segundos)
> **O que mostrar:** Abrir o arquivo `RDM.pdf` na tela.  
> **O que falar:**  
> *"Aqui apresento a **Ficha Simplificada de Registro de Mudança (RDM)**, estruturada em exatamente 1 página A4 conforme exigido no edital.*  
> *Ela documenta a versão 1.0.0 implantada, data e janela de implantação sem impacto, lista de parâmetros alterados no `.env`, o resultado detalhado dos testes de validação, plano de contingência com rollback em menos de 3 minutos e o parecer final: **[X] CONCLUÍDA COM SUCESSO**, devidamente assinada."*

---

### 6. Segurança da Aplicação (25 segundos)
> **O que falar:**  
> *"Em relação à segurança (DevSecOps):*  
> *1) Aplicação roda com usuário sem privilégios (`USER node`);*  
> *2) O banco de dados PostgreSQL é completamente inacessível externamente;*  
> *3) Segredos e senhas ficam isolados no `.env` e protegidos pelo `.gitignore`;*  
> *4) A API conta com validações estritas de entrada contra dados malformados e transições de status inválidas."*

---

### 7. Escalabilidade Conceitual para o Brasil Todo (30 segundos)
> **O que falar:**  
> *"Para escalar o EstuLanches para o Brasil inteiro — atendendo **1 milhão de alunos e 100 mil acessos simultâneos** no horário do recreio — adotaríamos a seguinte arquitetura:*  
> *1) **Kubernetes (K8s) com HPA**: Escalonamento horizontal automático de múltiplos containers Node.js de acordo com CPU e requisições;*  
> *2) **Load Balancer (NGINX / AWS ALB)**: Distribuição de carga entre as instâncias;*  
> *3) **Cache com Redis**: Para servir o cardápio e consultas frequentes em memória com latência inferior a 5 milissegundos;*  
> *4) **PostgreSQL com Cluster de Réplicas de Leitura**: O nó primário processa as gravações de pedidos, enquanto réplicas atendem as consultas de cardápio e fila.*  
> *Dessa forma, o sistema mantém alta disponibilidade e baixo tempo de resposta em escala nacional."*

---

### Encerramento (10 segundos)
> **O que falar:**  
> *"Com isso, todos os entregáveis — Dockerfile, docker-compose.yml, testes automatizados, RDM em PDF e sistema funcional — cumprem 100% dos critérios da atividade. Muito obrigado!"*

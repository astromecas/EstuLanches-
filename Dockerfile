FROM node:20-alpine

# Definir ambiente de produção
ENV NODE_ENV=production \
    PORT=8000

WORKDIR /usr/src/app

# Instalar dependências
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copiar código-fonte da aplicação
COPY src ./src
COPY public ./public
COPY images ./images
COPY docs ./docs
COPY visualizar.html .

# Execução segura sem privilégios de root (usuário padrão da imagem alpine)
USER node

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/health || exit 1

CMD ["node", "src/server.js"]

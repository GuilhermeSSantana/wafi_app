# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copiar o restante do projeto (pra não faltar public/assets/env)
COPY . .

# Injetar env do Vite NO BUILD
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV CI=false
ENV NODE_ENV=production

# Build
RUN echo "🔨 Iniciando build (VITE_API_URL=$VITE_API_URL)..." && \
    npm run build && \
    echo "✅ Build concluído com sucesso"

# Validar dist
RUN echo "🔍 Verificando arquivos gerados..." && \
    test -d dist && test -n "$(ls -A dist)" && \
    test -f dist/index.html && \
    echo "✅ dist OK" && ls -lah dist/ | head -20

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve && apk add --no-cache curl

COPY --from=builder /app/dist ./dist

ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null || exit 1

CMD sh -c "echo '🚀 Iniciando servidor em ${HOST}:${PORT}' && \
           echo '📁 Servindo /app/dist' && \
           ls -lah dist/ | head -10 && \
           exec serve -s dist -l tcp://${HOST}:${PORT} --no-clipboard"

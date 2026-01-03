# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --prefer-offline --no-audit

# Copiar arquivos de configuração
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./

# Copiar código source
COPY src ./src
COPY index.html ./

# Build da aplicação
ENV CI=false
ENV NODE_ENV=production

# Build da aplicação com verificação de erros
RUN echo "🔨 Iniciando build..." && \
    npm run build && \
    echo "✅ Build concluído com sucesso"

# Verificar se o build foi bem-sucedido
RUN echo "🔍 Verificando arquivos gerados..." && \
    if [ ! -d dist ] || [ -z "$(ls -A dist)" ]; then \
      echo "❌ Erro: Build falhou - diretório dist está vazio" && \
      ls -la dist/ || echo "Diretório dist não existe" && \
      exit 1; \
    fi && \
    echo "✅ Diretório dist existe e não está vazio"

# Verificar se index.html foi gerado
RUN if [ ! -f dist/index.html ]; then \
      echo "❌ Erro: dist/index.html não foi gerado" && \
      ls -la dist/ && \
      exit 1; \
    else \
      echo "✅ index.html encontrado"; \
    fi && \
    echo "📦 Conteúdo do dist:" && \
    ls -lah dist/ | head -20

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar servidor HTTP simples (serve) e wget para health check
RUN npm install -g serve && \
    apk add --no-cache wget

# Copiar arquivos built do stage anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Variável de ambiente para porta (padrão 3000)
ENV PORT=3000

# Health check - usar porta fixa 3000 para evitar problemas com variável
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando para iniciar a aplicação
# Usar exec para garantir que serve seja o processo principal (PID 1)
# Isso evita que o container seja encerrado prematuramente
CMD sh -c "echo '🚀 Iniciando servidor na porta ${PORT:-3000}' && \
           echo '📁 Servindo arquivos de: $(pwd)/dist' && \
           ls -lah dist/ | head -10 && \
           exec serve -s dist -l 0.0.0.0:${PORT:-3000} --no-clipboard"
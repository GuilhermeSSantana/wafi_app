# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar servidor HTTP simples (serve) e curl para health check
RUN npm install -g serve && \
    apk add --no-cache curl

# Copiar arquivos built do stage anterior
COPY --from=builder /app/dist ./dist

# Variável de ambiente para porta (padrão 3000)
ENV PORT=3000
ENV HOST=0.0.0.0

# Expor porta (informativo)
EXPOSE 3000

# Health check usando PORT real
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null || exit 1

# Start
CMD sh -c "echo '🚀 Iniciando servidor em ${HOST}:${PORT}' && \
           echo '📁 Servindo arquivos de: /app/dist' && \
           ls -lah dist/ | head -20 && \
           exec serve -s dist -l tcp://${HOST}:${PORT} --no-clipboard"

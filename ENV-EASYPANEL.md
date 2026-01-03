# 🔧 Variáveis de Ambiente para EasyPanel - Frontend

## 📋 Variáveis para o Serviço `app` (Frontend)

Configure estas variáveis no EasyPanel:

### Variáveis Obrigatórias

```env
VITE_API_URL=https://wafisync-service.gxzmrh.easypanel.host/api
PORT=3000
```

### Explicação

- **`VITE_API_URL`**: URL do backend em produção
  - Deve apontar para: `https://wafisync-service.gxzmrh.easypanel.host/api`
  - O `/api` no final é importante (o código normaliza, mas é melhor deixar explícito)

- **`PORT`**: Porta que o servidor vai usar dentro do container
  - Deve ser `3000` (não `80`)
  - Esta porta deve corresponder à porta configurada em "Advanced" → "Ports"

## 📝 Como Configurar no EasyPanel

1. Acesse o serviço `app` (frontend)
2. Vá em **"Environment Variables"** ou **"Variáveis de Ambiente"**
3. Adicione/Edite as variáveis:

   | Nome | Valor |
   |------|-------|
   | `VITE_API_URL` | `https://wafisync-service.gxzmrh.easypanel.host/api` |
   | `PORT` | `3000` |

4. **Salve** as alterações
5. **Faça deploy** do serviço

## ⚠️ Importante

- **NÃO** use `PORT=80` - isso causa conflito
- **NÃO** remova o `/api` do final da `VITE_API_URL`
- Certifique-se de que a porta em "Advanced" → "Ports" também seja `3000`

## 🔍 Verificação

Após configurar e fazer deploy, verifique os logs:

- Deve aparecer: `Accepting connections at http://localhost:3000`
- **NÃO** deve aparecer: `Accepting connections at http://localhost:80`

## 📋 Resumo Completo

```env
# Frontend - Variáveis de Ambiente EasyPanel
VITE_API_URL=https://wafisync-service.gxzmrh.easypanel.host/api
PORT=3000
```


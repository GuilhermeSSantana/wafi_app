# Wafi Sync - Frontend

Interface web para o sistema de gerenciamento financeiro Wafi Sync.

## Tecnologias

- React
- TypeScript
- Vite
- Styled Components
- React Router DOM
- Axios
- Recharts
- date-fns

## Estrutura

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços de API
│   ├── styles/         # Estilos globais e tema
│   └── types/          # Tipos TypeScript
└── public/             # Arquivos estáticos
```

## Configuração

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente (criar `.env`):
```
VITE_API_URL=http://localhost:3001/api
```

3. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
```

## Recursos

- Autenticação com JWT
- Dashboard com gráficos
- Gerenciamento de transações
- Upload de comprovantes (PDF, imagens, planilhas)
- OCR local para extração de dados
- Processamento de planilhas Excel/CSV
- Relatórios financeiros


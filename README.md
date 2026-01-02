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

## Padrão de Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/). 

Formato: `<tipo>(<escopo>): <descrição>`

**Tipos principais:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `refactor`: Refatoração
- `style`: Formatação
- `test`: Testes
- `chore`: Manutenção

**Exemplos:**
```bash
feat(auth): adiciona validação de token
fix(transactions): corrige cálculo de total
docs: atualiza instruções de instalação
```

Para mais detalhes, consulte [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md).

### Instalação e Configuração

1. Instalar dependências do commitlint:
```bash
npm install
```

2. (Opcional) Configurar template de commit message no Git:
```bash
git config commit.template .gitmessage
```

3. Validar mensagem de commit manualmente:
```bash
npm run commitlint
```


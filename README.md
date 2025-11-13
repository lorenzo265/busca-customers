# Codex Data Intelligence

Este repositório contém os serviços de busca de dados corporativos (`/app`) e a nova interface web corporativa (`/frontend`) construída segundo o PRD do produto Codex.

## Estrutura do Projeto

```
.
├── app/                # Backend FastAPI responsável pela busca e exportação
├── base.csv            # Base de dados de referência
├── frontend/           # Aplicação Next.js + Tailwind (novo)
├── requirements.txt    # Dependências Python do backend
└── tests/              # Testes backend existentes
```

## Frontend Codex

A aplicação frontend foi criada com **Next.js 14**, **TypeScript**, **TailwindCSS** e **Framer Motion**, adotando os tokens de design inspirados em Dell Technologies.

### Pré-requisitos

- Node.js 18+ (recomendado Node 20 ou 22)
- npm ou pnpm/yarn

### Instalação

```bash
cd frontend
npm install
```

Caso esteja em ambiente restrito a internet, instale as dependências previamente ou configure um registry interno para os pacotes NPM listados em `package.json`.

### Scripts disponíveis

```bash
npm run dev     # inicia o servidor Next.js em modo desenvolvimento
npm run build   # gera o build de produção
npm run start   # executa o build de produção
npm run lint    # roda ESLint com as regras do projeto
npm run test    # executa testes unitários (Vitest)
npm run test:ui # roda a suíte de Playwright
```

### Variáveis de ambiente

Crie um arquivo `.env.local` dentro de `frontend/` com a URL do backend FastAPI:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Convenções

- **Estilo**: TailwindCSS com tokens customizados (`codex-*`). Utilize o utilitário `cn` (`@/lib/utils`) para compor classes.
- **Estado remoto**: Utilize os hooks `useSchema`, `useSearch` e `useExport` que encapsulam React Query.
- **Filtros salvos**: `useSavedFilters` persiste preferências no `localStorage`.
- **Componentes UI**: Botões, cards, badges e inputs residem em `src/components/ui`.

### Layout implementado

- Sidebar com filtros ativos, biblioteca de filtros salvos e seletor de limite.
- Conteúdo principal com barra de busca inteligente, configuração dinâmica dos filtros expostos pelo `/schema` e grade de resultados com cabeçalho fixo.
- Painel lateral para exportação CSV/XLSX e estatísticas rápidas, com toasts de feedback corporativo.

## Backend (referência rápida)

A API Python (FastAPI) continua disponível dentro de `app/`. Consulte a documentação original para detalhes adicionais.

## Contribuição

1. Crie branches a partir de `main` com o prefixo correspondente (`feature/`, `fix/`, etc.).
2. Siga Conventional Commits (ex.: `feat: adiciona painel lateral de estatísticas`).
3. Abra PRs descrevendo escopo, testes e screenshots quando houver alterações visuais.

## Licença

Uso interno Dell Technologies – consulte o responsável do projeto para detalhes de licenciamento.
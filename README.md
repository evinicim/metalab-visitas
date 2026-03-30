# MetaLAB Visitas - Águas Emendadas

App mobile-first para gerenciar visitas domiciliares a alunos concluintes do projeto MetaLAB.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Supabase** (PostgreSQL + Auth)
- **Vercel** (deploy)

## Setup

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto (free tier)
2. Copie a **URL** e a **anon key** do projeto (Settings > API)
3. Copie também a **service_role key** (para o script de importação)

### 2. Criar as tabelas

No painel do Supabase, vá em **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/migrations/001_create_tables.sql
```

### 3. Criar usuário(s)

No painel do Supabase, vá em **Authentication > Users** e crie um usuário com e-mail e senha.

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Importar dados dos alunos

```bash
npm install -g tsx

SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_KEY=eyJhbGci... \
npx tsx scripts/import-students.mts
```

O script baixa os dados da planilha Google Sheets pública e insere no banco.

### 6. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

### 7. Deploy no Vercel

1. Push o código para um repositório Git (GitHub)
2. Conecte o repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático!

## Estrutura

```
src/
  app/
    login/          - Tela de login
    dashboard/      - Dashboard com estatísticas
    alunos/         - Lista de alunos (abas pendentes/visitados)
    alunos/[id]/    - Detalhe do aluno
    alunos/[id]/visita/ - Formulário de pesquisa
    auth/           - Callbacks de autenticação
  components/
    nav-bar.tsx     - Navegação mobile (bottom bar)
    student-card.tsx - Card de aluno na lista
    ui/             - Componentes shadcn/ui
  lib/
    supabase.ts     - Cliente Supabase (browser)
    supabase-server.ts - Cliente Supabase (server)
    types.ts        - Tipos TypeScript
scripts/
  import-students.mts - Importação de dados da planilha
supabase/
  migrations/       - SQL de criação das tabelas
```

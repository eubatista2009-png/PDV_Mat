# PDV Mat SaaS

Aplicacao SaaS de operacao varejista com foco em frente de caixa, estoque, financeiro e relatorios. A base foi desenhada para rodar em Next.js 14 com App Router, Supabase e deploy na Vercel.

## Stack

- Next.js 14
- React 18
- Tailwind CSS
- Supabase Auth, Postgres e Storage
- Zod + React Hook Form
- Chart.js para dashboards

## Fluxos entregues

- Login com email e senha
- Modo demonstracao quando o Supabase nao estiver configurado
- Dashboard operacional com indicadores e graficos
- PDV com busca por produto, carrinho e finalizacao de venda
- Regra para impedir venda sem estoque
- Estoque com alertas de minimo e lucro unitario
- Financeiro com leitura de entradas e saidas
- Relatorios com faturamento, ticket medio e top produtos

## Como rodar

1. Instale as dependencias.
2. Copie .env.example para .env.local.
3. Preencha NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.
4. Execute o schema em database/schema.sql no Supabase.
5. Rode o projeto com npm run dev.

## Checklist de deploy em producao (Supabase + Vercel)

### 1. Criar projeto no Supabase

1. Acesse app.supabase.com e crie um projeto novo.
2. Escolha a regiao mais proxima ao usuario final (ex: South America - São Paulo).
3. Defina uma senha forte para o banco.

### 2. Executar o schema

1. Abra o **SQL Editor** do projeto Supabase.
2. Cole o conteudo de **database/schema.sql** inteiro e clique em Run.
3. Cole o conteudo de **database/seed.sql** e execute — insere os 10 produtos iniciais.

### 3. Criar o primeiro admin

1. Va em **Authentication → Users → Invite User** no Supabase Dashboard.
2. Convide o email do admin.
3. Apos o usuario confirmar o email, copie o UUID dele na listagem.
4. No SQL Editor execute:

```sql
select promote_to_admin('<uuid-do-usuario>');
```

### 4. Obter as chaves do Supabase

1. Va em **Settings → API** no projeto Supabase.
2. Copie **Project URL** → NEXT_PUBLIC_SUPABASE_URL
3. Copie **anon public** → NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Copie **service_role secret** → SUPABASE_SERVICE_ROLE_KEY

### 5. Publicar o repositorio no GitHub

```bash
git init
git add .
git commit -m "chore: initial production-ready commit"
git remote add origin <url-do-repo>
git push -u origin main
```

### 6. Deploy na Vercel

1. Acesse vercel.com e crie um novo projeto apontando para o repositorio.
2. Na etapa **Environment Variables**, adicione as tres chaves acima.
3. A regiao ja esta definida como **gru1 (São Paulo)** via vercel.json.
4. Clique em **Deploy**.

### 7. Configurar Auth Redirect URL

1. No Supabase Dashboard va em **Authentication → URL Configuration**.
2. Em **Site URL** coloque a URL de producao da Vercel (ex: https://pdv-mat.vercel.app).
3. Em **Redirect URLs** adicione a mesma URL mais o callback:
   https://pdv-mat.vercel.app/auth/callback


## Modelo de acesso

- admin: acesso total, incluindo financeiro e relatorios
- operator: acesso a dashboard, PDV e estoque

## Estrutura

- app: rotas e paginas da aplicacao
- components: shell, telas e componentes reutilizaveis
- lib: auth, formatacao, tipos e integracao Supabase
- services: regras de consulta e agregacao de negocio
- database: schema SQL e funcao transacional de venda

## Proximos passos de produto

- Adicionar Stripe para monetizacao dos planos Free, Pro e Premium
- Criar limite de vendas por tenant no plano Free
- Incluir multi-loja com tenant_id em todas as tabelas
- Publicar relatorios avancados e rotinas de backup

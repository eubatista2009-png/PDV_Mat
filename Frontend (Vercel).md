Frontend (Vercel)
  ↓
API (Next.js API Routes ou Supabase Functions)
  ↓
Banco de Dados (Supabase - PostgreSQL)
  ↓
Auth (Supabase Auth)

Frontend:
- Next.js 14
- React
- TailwindCSS

Backend:
- Supabase (PostgreSQL + Auth + Storage)

Infra:
- Vercel (deploy frontend)
- GitHub (repositório privado)

Extras:
- Zod (validação)
- React Hook Form (forms)
- Chart.js (dashboards)

Selecionar produto → Adicionar ao carrinho → Calcular total → Finalizar venda → Baixar estoque → Registrar financeiro

Produto:
- id
- nome
- categoria
- preço_custo
- preço_venda
- quantidade
- estoque_minimo
- código barras

Financeiro:
- id
- tipo (entrada/saida)
- valor
- descrição
- data
- origem (venda/manual)

-- Tabela de produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  categoria TEXT,
  preco_custo NUMERIC,
  preco_venda NUMERIC,
  quantidade INT,
  estoque_minimo INT,
  codigo_barras TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total NUMERIC,
  forma_pagamento TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Itens da venda
CREATE TABLE itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES vendas(id),
  produto_id UUID REFERENCES produtos(id),
  quantidade INT,
  preco NUMERIC
);

-- Financeiro
CREATE TABLE financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT,
  valor NUMERIC,
  descricao TEXT,
  origem TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

- Ao finalizar venda:
  → Baixar estoque automaticamente
  → Registrar entrada no financeiro

- Não permitir venda sem estoque

- Alertar produtos abaixo do estoque mínimo

- Calcular lucro:
  lucro = preco_venda - preco_custo

/ login
/ dashboard
/ pdv
/ estoque
/ financeiro
/ relatórios

// /app/pdv/page.tsx

export default function PDV() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Frente de Caixa</h1>

      <input
        placeholder="Código de barras"
        className="border p-2 w-full"
      />

      <div className="mt-4">
        {/* Lista de produtos */}
      </div>

      <button className="bg-green-500 text-white p-3 mt-4">
        Finalizar Venda
      </button>
    </div>
  );
}

- Login por email/senha
- Controle de acesso:
  - Admin
  - Operador de caixa

mini-saas-loja/

├── app/
│   ├── dashboard/
│   ├── pdv/
│   ├── estoque/
│   ├── financeiro/
│   └── login/
│
├── components/
│   ├── ui/
│   ├── pdv/
│   ├── estoque/
│
├── lib/
│   ├── supabaseClient.ts
│   ├── utils.ts
│
├── services/
│   ├── vendasService.ts
│   ├── estoqueService.ts
│   ├── financeiroService.ts
│
├── styles/
│
├── .env.local
├── package.json
└── README.md

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

git init
git remote add origin <repo>
git push -u origin main

Plano Free:
- Até 100 vendas/mês

Plano PRO (R$49/mês):
- Vendas ilimitadas
- Relatórios avançados

Plano Premium (R$99/mês):
- Multi-lojas
- Backup automático

Plano Free:
- Até 100 vendas/mês

Plano PRO (R$49/mês):
- Vendas ilimitadas
- Relatórios avançados

Plano Premium (R$99/mês):
- Multi-lojas
- Backup automático
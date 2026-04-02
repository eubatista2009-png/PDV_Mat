import { subDays } from 'date-fns';

import type { FinancialEntry, Product, Sale } from '@/lib/types';

const now = new Date();

export const demoProducts: Product[] = [
  {
    id: 'prod-1',
    nome: 'Cafe Especial 250g',
    categoria: 'Mercearia',
    preco_custo: 17.4,
    preco_venda: 29.9,
    quantidade: 18,
    estoque_minimo: 8,
    codigo_barras: '789100000001',
    created_at: subDays(now, 30).toISOString()
  },
  {
    id: 'prod-2',
    nome: 'Bolo de Fuba Caseiro',
    categoria: 'Padaria',
    preco_custo: 8.2,
    preco_venda: 16.5,
    quantidade: 5,
    estoque_minimo: 6,
    codigo_barras: '789100000002',
    created_at: subDays(now, 18).toISOString()
  },
  {
    id: 'prod-3',
    nome: 'Queijo Minas Frescal',
    categoria: 'Frios',
    preco_custo: 19.5,
    preco_venda: 31.9,
    quantidade: 12,
    estoque_minimo: 4,
    codigo_barras: '789100000003',
    created_at: subDays(now, 22).toISOString()
  },
  {
    id: 'prod-4',
    nome: 'Suco Integral Uva 1L',
    categoria: 'Bebidas',
    preco_custo: 9.8,
    preco_venda: 15.9,
    quantidade: 27,
    estoque_minimo: 10,
    codigo_barras: '789100000004',
    created_at: subDays(now, 11).toISOString()
  },
  {
    id: 'prod-5',
    nome: 'Chocolate 70% Cacau',
    categoria: 'Conveniência',
    preco_custo: 6.2,
    preco_venda: 12.9,
    quantidade: 9,
    estoque_minimo: 5,
    codigo_barras: '789100000005',
    created_at: subDays(now, 8).toISOString()
  }
];

export const demoSales: Sale[] = [
  {
    id: 'sale-1',
    total: 62.3,
    forma_pagamento: 'pix',
    created_at: subDays(now, 1).toISOString(),
    itens: [
      {
        produto_id: 'prod-1',
        nome: 'Cafe Especial 250g',
        quantidade: 1,
        preco: 29.9,
        subtotal: 29.9
      },
      {
        produto_id: 'prod-4',
        nome: 'Suco Integral Uva 1L',
        quantidade: 2,
        preco: 15.9,
        subtotal: 31.8
      }
    ]
  },
  {
    id: 'sale-2',
    total: 61.3,
    forma_pagamento: 'cartao',
    created_at: subDays(now, 3).toISOString(),
    itens: [
      {
        produto_id: 'prod-3',
        nome: 'Queijo Minas Frescal',
        quantidade: 1,
        preco: 31.9,
        subtotal: 31.9
      },
      {
        produto_id: 'prod-5',
        nome: 'Chocolate 70% Cacau',
        quantidade: 1,
        preco: 12.9,
        subtotal: 12.9
      },
      {
        produto_id: 'prod-2',
        nome: 'Bolo de Fuba Caseiro',
        quantidade: 1,
        preco: 16.5,
        subtotal: 16.5
      }
    ]
  },
  {
    id: 'sale-3',
    total: 47.7,
    forma_pagamento: 'dinheiro',
    created_at: subDays(now, 6).toISOString(),
    itens: [
      {
        produto_id: 'prod-4',
        nome: 'Suco Integral Uva 1L',
        quantidade: 3,
        preco: 15.9,
        subtotal: 47.7
      }
    ]
  }
];

export const demoFinanceEntries: FinancialEntry[] = [
  {
    id: 'fin-1',
    tipo: 'entrada',
    valor: 62.3,
    descricao: 'Venda no PDV #sale-1',
    origem: 'venda',
    created_at: subDays(now, 1).toISOString()
  },
  {
    id: 'fin-2',
    tipo: 'entrada',
    valor: 61.3,
    descricao: 'Venda no PDV #sale-2',
    origem: 'venda',
    created_at: subDays(now, 3).toISOString()
  },
  {
    id: 'fin-3',
    tipo: 'saida',
    valor: 38,
    descricao: 'Reposicao de padaria',
    origem: 'manual',
    created_at: subDays(now, 4).toISOString()
  },
  {
    id: 'fin-4',
    tipo: 'entrada',
    valor: 47.7,
    descricao: 'Venda no PDV #sale-3',
    origem: 'venda',
    created_at: subDays(now, 6).toISOString()
  }
];
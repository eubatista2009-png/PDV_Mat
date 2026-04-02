import 'server-only';

import { demoProducts, demoSales } from '@/lib/demo-data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { CheckoutInput, CheckoutResult, Product, Sale } from '@/lib/types';

function assertStock(items: CheckoutInput['items'], products: Product[]) {
  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.produtoId);

    if (!product) {
      throw new Error(`Produto ${item.nome} nao encontrado.`);
    }

    if (product.quantidade < item.quantidade) {
      throw new Error(`Estoque insuficiente para ${item.nome}.`);
    }
  }
}

function mapSaleRecord(sale: {
  id: string;
  total: number | string;
  forma_pagamento: string;
  created_at: string;
  itens_venda?: Array<{
    produto_id: string;
    quantidade: number;
    preco: number | string;
    produtos?: { nome?: string } | Array<{ nome?: string }> | null;
  }> | null;
}): Sale {
  return {
    id: sale.id,
    total: Number(sale.total),
    forma_pagamento: sale.forma_pagamento,
    created_at: sale.created_at,
    itens: (sale.itens_venda ?? []).map((item) => {
      const produtoRelacionamento = item.produtos as { nome?: string } | Array<{ nome?: string }> | null;
      const nome = Array.isArray(produtoRelacionamento)
        ? produtoRelacionamento[0]?.nome ?? 'Produto'
        : produtoRelacionamento?.nome ?? 'Produto';

      return {
        produto_id: item.produto_id,
        nome,
        quantidade: item.quantidade,
        preco: Number(item.preco),
        subtotal: Number(item.preco) * item.quantidade
      };
    })
  };
}

export async function listSales(options?: { limit?: number }): Promise<Sale[]> {
  const supabase = getSupabaseServerClient();
  const limit = options?.limit;

  if (!supabase) {
    return typeof limit === 'number' ? demoSales.slice(0, limit) : demoSales;
  }

  let query = supabase
    .from('vendas')
    .select('id, total, forma_pagamento, created_at, itens_venda(produto_id, quantidade, preco, produtos(nome))')
    .order('created_at', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    return typeof limit === 'number' ? demoSales.slice(0, limit) : demoSales;
  }

  return data.map(mapSaleRecord);
}

export async function listRecentSales(): Promise<Sale[]> {
  return listSales({ limit: 10 });
}

export async function checkoutVenda(input: CheckoutInput): Promise<CheckoutResult> {
  const total = input.items.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    assertStock(input.items, demoProducts);

    return {
      vendaId: `demo-${Date.now()}`,
      total,
      message: 'Venda concluida em modo demonstracao.'
    };
  }

  const { error, data } = await supabase.rpc('finalizar_venda', {
    forma_pagamento_input: input.formaPagamento,
    itens_input: input.items.map((item) => ({
      produto_id: item.produtoId,
      quantidade: item.quantidade,
      preco: item.preco
    }))
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    vendaId: data?.id ?? `sale-${Date.now()}`,
    total: Number(data?.total ?? total),
    message: 'Venda concluida com baixa de estoque e lancamento financeiro.'
  };
}
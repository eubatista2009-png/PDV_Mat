import 'server-only';

import { demoProducts } from '@/lib/demo-data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export async function listProdutos(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return demoProducts;
  }

  const { data, error } = await supabase.from('produtos').select('*').order('nome');

  if (error || !data) {
    return demoProducts;
  }

  return data;
}

export async function searchProdutos(query: string) {
  const products = await listProdutos();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return products;
  }

  return products.filter((product) => {
    return (
      product.nome.toLowerCase().includes(normalized) ||
      product.categoria.toLowerCase().includes(normalized) ||
      product.codigo_barras.includes(normalized)
    );
  });
}
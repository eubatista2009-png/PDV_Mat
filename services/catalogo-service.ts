import 'server-only';

import { unstable_noStore as noStore } from 'next/cache';

import { demoProducts } from '@/lib/demo-data';
import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export async function listProdutos(): Promise<Product[]> {
  noStore();

  const supabase = getSupabaseServerClient();
  const supabaseAdmin = getSupabaseAdminClient();

  if (!supabase && !supabaseAdmin) {
    return demoProducts;
  }

  if (supabase) {
    const { data, error } = await supabase.from('produtos').select('*').order('nome');

    if (!error && data) {
      return data;
    }
  }

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('produtos').select('*').order('nome');

    if (!error && data) {
      return data;
    }
  }

  return isSupabaseConfigured() ? [] : demoProducts;
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
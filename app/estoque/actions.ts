'use server';

import * as XLSX from 'xlsx';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { fetchGoogleProductSpecsByBarcode } from '@/services/google-product-specs-service';

type ActionResult = {
  ok: boolean;
  message: string;
};

const HEADER_ALIASES = {
  nome: ['nome', 'produto', 'descricao'],
  categoria: ['categoria', 'grupo'],
  preco_custo: ['preco_custo', 'preco custo', 'custo', 'valor_custo'],
  preco_venda: ['preco_venda', 'preco venda', 'venda', 'valor_venda'],
  quantidade: ['quantidade', 'qtd', 'estoque'],
  estoque_minimo: ['estoque_minimo', 'estoque minimo', 'minimo', 'qtd_minima'],
  codigo_barras: ['codigo_barras', 'codigo barras', 'cod_barras', 'ean', 'ean13'],
  ncm: ['ncm']
} as const;

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function getValueByAliases(row: Record<string, unknown>, aliases: readonly string[]) {
  for (const alias of aliases) {
    if (alias in row) {
      return row[alias];
    }
  }

  return null;
}

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toBarcode(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  if (typeof value === 'string') {
    return value.replace(/\D/g, '').trim();
  }

  return '';
}

export async function importEstoquePlanilhaAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    return { ok: false, message: 'Somente administradores podem importar estoque.' };
  }

  const file = formData.get('planilha');

  if (!(file instanceof File)) {
    return { ok: false, message: 'Selecione um arquivo .xlsx, .xls ou .csv.' };
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase admin nao configurado. Defina SUPABASE_SERVICE_ROLE_KEY para importar estoque.'
    };
  }

  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return { ok: false, message: 'A planilha esta vazia.' };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null });

  if (!rawRows.length) {
    return { ok: false, message: 'Nenhuma linha encontrada na planilha.' };
  }

  const rows = rawRows.map((row) => {
    const normalizedRow: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      normalizedRow[normalizeHeader(key)] = value;
    }

    return normalizedRow;
  });

  const upsertRows: Array<{
    nome: string;
    categoria: string;
    preco_custo: number;
    preco_venda: number;
    quantidade: number;
    estoque_minimo: number;
    codigo_barras: string;
  }> = [];

  let invalidRows = 0;

  for (const row of rows) {
    const nome = String(getValueByAliases(row, HEADER_ALIASES.nome) ?? '').trim();
    const categoria = String(getValueByAliases(row, HEADER_ALIASES.categoria) ?? '').trim();
    const precoCusto = toNumber(getValueByAliases(row, HEADER_ALIASES.preco_custo));
    const precoVenda = toNumber(getValueByAliases(row, HEADER_ALIASES.preco_venda));
    const quantidade = toNumber(getValueByAliases(row, HEADER_ALIASES.quantidade));
    const estoqueMinimo = toNumber(getValueByAliases(row, HEADER_ALIASES.estoque_minimo));
    const codigoBarras = toBarcode(getValueByAliases(row, HEADER_ALIASES.codigo_barras));

    const isValid =
      Boolean(nome) &&
      Boolean(categoria) &&
      precoCusto !== null &&
      precoVenda !== null &&
      quantidade !== null &&
      estoqueMinimo !== null &&
      Boolean(codigoBarras);

    if (!isValid) {
      invalidRows += 1;
      continue;
    }

    upsertRows.push({
      nome,
      categoria,
      preco_custo: Math.max(0, Number(precoCusto.toFixed(2))),
      preco_venda: Math.max(0, Number(precoVenda.toFixed(2))),
      quantidade: Math.max(0, Math.trunc(quantidade)),
      estoque_minimo: Math.max(0, Math.trunc(estoqueMinimo)),
      codigo_barras: codigoBarras
    });
  }

  if (!upsertRows.length) {
    return {
      ok: false,
      message: 'Nenhuma linha valida encontrada. Verifique os campos obrigatorios: nome, categoria, preco_custo, preco_venda, quantidade, estoque_minimo, codigo_barras.'
    };
  }

  const { error } = await supabase.from('produtos').upsert(upsertRows, { onConflict: 'codigo_barras' });

  if (error) {
    return { ok: false, message: `Falha ao importar planilha: ${error.message}` };
  }

  revalidatePath('/estoque');

  return {
    ok: true,
    message: `Importacao concluida. ${upsertRows.length} linhas processadas com sucesso${invalidRows ? ` e ${invalidRows} linhas invalidas ignoradas` : ''}.`
  };
}

export async function entradaPorCodigoBarrasAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    return { ok: false, message: 'Somente administradores podem registrar entrada por codigo de barras.' };
  }

  const codigoBarras = String(formData.get('codigo_barras') ?? '').replace(/\D/g, '').trim();
  const quantidadeEntrada = Number(formData.get('quantidade_entrada') ?? 0);

  if (!codigoBarras) {
    return { ok: false, message: 'Informe um codigo de barras valido.' };
  }

  if (!Number.isFinite(quantidadeEntrada) || quantidadeEntrada <= 0) {
    return { ok: false, message: 'Informe uma quantidade de entrada maior que zero.' };
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase admin nao configurado. Defina SUPABASE_SERVICE_ROLE_KEY para registrar entrada por codigo de barras.'
    };
  }

  const { data: product, error: selectError } = await supabase
    .from('produtos')
    .select('id, nome, quantidade')
    .eq('codigo_barras', codigoBarras)
    .maybeSingle();

  if (selectError) {
    return { ok: false, message: `Erro ao buscar produto: ${selectError.message}` };
  }

  if (!product) {
    const googleSpecs = await fetchGoogleProductSpecsByBarcode(codigoBarras);

    if (!googleSpecs) {
      return {
        ok: false,
        message:
          'Produto nao encontrado no estoque e nao foi possivel obter especificacoes via Google. Verifique GOOGLE_API_KEY/GOOGLE_CSE_ID ou cadastre o item pela planilha.'
      };
    }

    const nomeSugerido = googleSpecs.title || `Produto ${codigoBarras}`;
    const categoriaSugerida = 'Nao categorizado';

    const { data: insertedProduct, error: insertError } = await supabase
      .from('produtos')
      .insert({
        nome: nomeSugerido,
        categoria: categoriaSugerida,
        preco_custo: 0,
        preco_venda: 0,
        quantidade: Math.trunc(quantidadeEntrada),
        estoque_minimo: 0,
        codigo_barras: codigoBarras
      })
      .select('nome, quantidade')
      .single();

    if (insertError || !insertedProduct) {
      return {
        ok: false,
        message: `Produto nao encontrado e falha ao cadastrar com dados do Google: ${insertError?.message ?? 'erro desconhecido'}`
      };
    }

    return {
      ok: true,
      message: `Produto criado via Google (${insertedProduct.nome}) e entrada registrada com ${insertedProduct.quantidade} unidades.${googleSpecs.link ? ` Fonte: ${googleSpecs.link}` : ''}`
    };
  }

  const novaQuantidade = Math.max(0, Number(product.quantidade) + Math.trunc(quantidadeEntrada));
  const { error: updateError } = await supabase.from('produtos').update({ quantidade: novaQuantidade }).eq('id', product.id);

  if (updateError) {
    return { ok: false, message: `Erro ao atualizar estoque: ${updateError.message}` };
  }

  revalidatePath('/estoque');

  return {
    ok: true,
    message: `Entrada registrada para ${product.nome}. Estoque atualizado para ${novaQuantidade} unidades.`
  };
}

export async function excluirProdutoEstoqueAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    return { ok: false, message: 'Somente administradores podem excluir itens do estoque.' };
  }

  const productId = String(formData.get('product_id') ?? '').trim();

  if (!productId) {
    return { ok: false, message: 'Produto invalido para exclusao.' };
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase admin nao configurado. Defina SUPABASE_SERVICE_ROLE_KEY para excluir itens.'
    };
  }

  const { error } = await supabase.from('produtos').delete().eq('id', productId);

  if (error) {
    return { ok: false, message: `Falha ao excluir item: ${error.message}` };
  }

  revalidatePath('/estoque');

  return { ok: true, message: 'Item excluido com sucesso.' };
}

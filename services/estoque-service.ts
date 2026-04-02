import 'server-only';

import { listProdutos } from '@/services/catalogo-service';

export async function listProdutosBaixoEstoque() {
  const products = await listProdutos();
  return products.filter((item) => item.quantidade <= item.estoque_minimo);
}

export async function getStockSnapshot() {
  const products = await listProdutos();

  return {
    totalItens: products.length,
    itensCriticos: products.filter((item) => item.quantidade <= item.estoque_minimo).length,
    valorEmEstoque: products.reduce((total, item) => total + item.quantidade * item.preco_custo, 0)
  };
}
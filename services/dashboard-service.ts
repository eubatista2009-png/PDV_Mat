import 'server-only';

import { formatCurrency } from '@/lib/format';
import type { DashboardData, Product, ReportData, Sale } from '@/lib/types';
import { listProdutos } from '@/services/catalogo-service';
import { listProdutosBaixoEstoque } from '@/services/estoque-service';
import { listFinanceiro } from '@/services/financeiro-service';
import { listRecentSales } from '@/services/vendas-service';

function groupByCategory(products: Product[]) {
  const grouped = new Map<string, number>();

  for (const product of products) {
    const current = grouped.get(product.categoria) ?? 0;
    grouped.set(product.categoria, current + product.quantidade);
  }

  return [...grouped.entries()].map(([label, value]) => ({ label, value }));
}

function estimateProfit(sales: Sale[], products: Product[]) {
  const costMap = new Map(products.map((product) => [product.id, product.preco_custo]));

  return sales.reduce((profit, sale) => {
    return (
      profit +
      sale.itens.reduce((saleProfit, item) => {
        const cost = costMap.get(item.produto_id) ?? 0;
        return saleProfit + (item.preco - cost) * item.quantidade;
      }, 0)
    );
  }, 0);
}

function buildMonthlyRevenue(sales: Sale[]) {
  const monthMap = new Map<string, number>();

  for (const sale of sales) {
    const date = new Date(sale.created_at);
    const label = date.toLocaleDateString('pt-BR', { month: 'short' });
    monthMap.set(label, (monthMap.get(label) ?? 0) + sale.total);
  }

  return [...monthMap.entries()].map(([label, value]) => ({ label, value }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const [products, sales, lowStock, financeiro] = await Promise.all([
    listProdutos(),
    listRecentSales(),
    listProdutosBaixoEstoque(),
    listFinanceiro()
  ]);

  const totalRevenue = financeiro.filter((item) => item.tipo === 'entrada').reduce((sum, item) => sum + Number(item.valor), 0);
  const outflow = financeiro.filter((item) => item.tipo === 'saida').reduce((sum, item) => sum + Number(item.valor), 0);
  const averageTicket = sales.length ? totalRevenue / sales.length : 0;

  return {
    metrics: [
      {
        label: 'Faturamento acumulado',
        value: formatCurrency(totalRevenue),
        helper: `${sales.length} vendas registradas`
      },
      {
        label: 'Ticket medio',
        value: formatCurrency(averageTicket),
        helper: 'Meta recomendada: acima de R$ 45'
      },
      {
        label: 'Saidas operacionais',
        value: formatCurrency(outflow),
        helper: 'Lancamentos financeiros manuais'
      },
      {
        label: 'Itens em alerta',
        value: String(lowStock.length),
        helper: 'Produtos abaixo do estoque minimo'
      }
    ],
    monthlyRevenue: buildMonthlyRevenue(sales),
    categoryShare: groupByCategory(products),
    lowStock,
    recentSales: sales
  };
}

export async function getReportData(): Promise<ReportData> {
  const [products, sales, financeiro] = await Promise.all([listProdutos(), listRecentSales(), listFinanceiro()]);
  const faturamento = financeiro.filter((item) => item.tipo === 'entrada').reduce((sum, item) => sum + item.valor, 0);
  const ticketMedio = sales.length ? faturamento / sales.length : 0;
  const lucroEstimado = estimateProfit(sales, products);

  const paymentMap = new Map<string, number>();
  const productMap = new Map<string, number>();

  for (const sale of sales) {
    paymentMap.set(sale.forma_pagamento, (paymentMap.get(sale.forma_pagamento) ?? 0) + sale.total);

    for (const item of sale.itens) {
      productMap.set(item.nome, (productMap.get(item.nome) ?? 0) + item.quantidade);
    }
  }

  return {
    totalVendas: sales.length,
    faturamento,
    ticketMedio,
    lucroEstimado,
    formasPagamento: [...paymentMap.entries()].map(([label, value]) => ({ label, value })),
    topProdutos: [...productMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5)
  };
}
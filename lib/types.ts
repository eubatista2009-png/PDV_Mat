export type UserRole = 'admin' | 'operator';

export type Product = {
  id: string;
  nome: string;
  categoria: string;
  preco_custo: number;
  preco_venda: number;
  quantidade: number;
  estoque_minimo: number;
  codigo_barras: string;
  created_at: string;
};

export type SaleItem = {
  id?: string;
  produto_id: string;
  nome: string;
  quantidade: number;
  preco: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  total: number;
  forma_pagamento: string;
  created_at: string;
  itens: SaleItem[];
};

export type FinancialEntry = {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  origem: 'venda' | 'manual';
  created_at: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  monthlyRevenue: Array<{ label: string; value: number }>;
  categoryShare: Array<{ label: string; value: number }>;
  lowStock: Product[];
  recentSales: Sale[];
};

export type CheckoutInput = {
  formaPagamento: string;
  items: Array<{
    produtoId: string;
    nome: string;
    quantidade: number;
    preco: number;
  }>;
};

export type CheckoutResult = {
  vendaId: string;
  total: number;
  message: string;
};

export type ReportData = {
  totalVendas: number;
  faturamento: number;
  ticketMedio: number;
  lucroEstimado: number;
  formasPagamento: Array<{ label: string; value: number }>;
  topProdutos: Array<{ label: string; value: number }>;
};

export type AuthUser = {
  email: string;
  role: UserRole;
  demo: boolean;
};
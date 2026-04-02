import { AppShell } from '@/components/layout/app-shell';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { formatCurrency, formatDate } from '@/lib/format';
import { requireUser } from '@/lib/auth';
import { getDashboardData } from '@/services/dashboard-service';

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData();

  return (
    <AppShell
      title="Cockpit da operacao"
      description="Acompanhe caixa, estoque critico e ritmo de vendas em uma leitura de poucos segundos."
      pathname="/dashboard"
      email={user.email}
      role={user.role}
      demo={user.demo}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <KpiCard key={metric.label} {...metric} />
        ))}
      </div>

      <RevenueChart revenue={data.monthlyRevenue} categories={data.categoryShare} />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface rounded-[28px] p-6 shadow-soft">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Ruptura iminente</h3>
          <div className="mt-5 space-y-3">
            {data.lowStock.map((product) => (
              <div key={product.id} className="rounded-3xl bg-white px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-ink">{product.nome}</p>
                    <p className="text-sm text-ink/55">Minimo {product.estoque_minimo} unidades</p>
                  </div>
                  <span className="rounded-full bg-clay/10 px-3 py-1 text-sm font-semibold text-clay">{product.quantidade} un</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[28px] p-6 shadow-soft">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Ultimas vendas</h3>
          <div className="mt-5 space-y-3">
            {data.recentSales.map((sale) => (
              <div key={sale.id} className="rounded-3xl bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">Venda {sale.id}</p>
                    <p className="text-sm text-ink/55">{formatDate(sale.created_at)} • {sale.forma_pagamento}</p>
                  </div>
                  <span className="font-semibold text-forest">{formatCurrency(sale.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </AppShell>
  );
}
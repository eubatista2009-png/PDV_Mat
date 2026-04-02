import { AppShell } from '@/components/layout/app-shell';
import { FinanceTable } from '@/components/financeiro/finance-table';
import { formatCurrency } from '@/lib/format';
import { requireAdmin } from '@/lib/auth';
import { listFinanceiro } from '@/services/financeiro-service';

export default async function FinanceiroPage() {
  const user = await requireAdmin();
  const entries = await listFinanceiro();
  const entradas = entries.filter((item) => item.tipo === 'entrada').reduce((sum, item) => sum + item.valor, 0);
  const saidas = entries.filter((item) => item.tipo === 'saida').reduce((sum, item) => sum + item.valor, 0);

  return (
    <AppShell
      title="Financeiro"
      description="Fluxo de caixa focado em entrada de vendas, saidas operacionais e leitura de margem."
      pathname="/financeiro"
      email={user.email}
      role={user.role}
      demo={user.demo}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Entradas</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-forest">{formatCurrency(entradas)}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Saidas</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-clay">{formatCurrency(saidas)}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Saldo operacional</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{formatCurrency(entradas - saidas)}</h3>
        </article>
      </div>

      <FinanceTable entries={entries} />
    </AppShell>
  );
}
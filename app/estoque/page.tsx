import { AppShell } from '@/components/layout/app-shell';
import { StockTable } from '@/components/estoque/stock-table';
import { formatCurrency } from '@/lib/format';
import { requireUser } from '@/lib/auth';
import { getStockSnapshot } from '@/services/estoque-service';
import { listProdutos } from '@/services/catalogo-service';

export default async function EstoquePage() {
  const user = await requireUser();
  const [products, snapshot] = await Promise.all([listProdutos(), getStockSnapshot()]);

  return (
    <AppShell
      title="Estoque vivo"
      description="Visualize margem, itens criticos e o capital parado em estoque antes de virar ruptura."
      pathname="/estoque"
      email={user.email}
      role={user.role}
      demo={user.demo}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">SKUs ativos</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{snapshot.totalItens}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Itens criticos</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-clay">{snapshot.itensCriticos}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Valor em estoque</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{formatCurrency(snapshot.valorEmEstoque)}</h3>
        </article>
      </div>

      <StockTable products={products} />
    </AppShell>
  );
}
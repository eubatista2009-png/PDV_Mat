import { AppShell } from '@/components/layout/app-shell';
import { StockImportPanel } from '@/components/estoque/stock-import-panel';
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

      <article className="surface rounded-[28px] p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-[var(--font-heading)] text-xl text-ink">Entrada de estoque</h3>
            <p className="mt-1 text-sm text-ink/65">Importe em lote por planilha ou registre entradas por leitura de codigo de barras.</p>
          </div>
          <a
            href="/modelos/entrada_estoque_template.csv"
            className="inline-flex items-center justify-center rounded-2xl border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            Baixar modelo CSV
          </a>
        </div>
      </article>

      <StockImportPanel isAdmin={user.role === 'admin'} />

      <StockTable products={products} />
    </AppShell>
  );
}
import { formatCurrency, formatNumber } from '@/lib/format';
import type { ReportData } from '@/lib/types';

type ReportPanelProps = {
  report: ReportData;
};

export function ReportPanel({ report }: ReportPanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Vendas realizadas</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{formatNumber(report.totalVendas)}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Faturamento</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{formatCurrency(report.faturamento)}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Ticket medio</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{formatCurrency(report.ticketMedio)}</h3>
        </article>
        <article className="surface rounded-[28px] p-5 shadow-soft">
          <p className="text-sm text-ink/60">Lucro estimado</p>
          <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{formatCurrency(report.lucroEstimado)}</h3>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-[28px] p-6 shadow-soft">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Formas de pagamento</h3>
          <div className="mt-5 space-y-3">
            {report.formasPagamento.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span className="capitalize text-ink/70">{item.label}</span>
                <span className="font-semibold text-ink">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[28px] p-6 shadow-soft">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Top produtos</h3>
          <div className="mt-5 space-y-3">
            {report.topProdutos.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span className="text-ink/70">{item.label}</span>
                <span className="font-semibold text-ink">{item.value} un</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
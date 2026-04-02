import { formatCurrency, formatDate } from '@/lib/format';
import type { FinancialEntry } from '@/lib/types';

type FinanceTableProps = {
  entries: FinancialEntry[];
};

export function FinanceTable({ entries }: FinanceTableProps) {
  return (
    <div className="surface overflow-hidden rounded-[28px] shadow-soft">
      <table className="min-w-full divide-y divide-ink/10 text-left">
        <thead className="bg-sand/80 text-sm text-ink/60">
          <tr>
            <th className="px-5 py-4 font-medium">Tipo</th>
            <th className="px-5 py-4 font-medium">Descricao</th>
            <th className="px-5 py-4 font-medium">Origem</th>
            <th className="px-5 py-4 font-medium">Data</th>
            <th className="px-5 py-4 font-medium">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5 bg-white text-sm text-ink/75">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-5 py-4">
                <span className={entry.tipo === 'entrada' ? 'font-semibold text-forest' : 'font-semibold text-clay'}>
                  {entry.tipo}
                </span>
              </td>
              <td className="px-5 py-4">{entry.descricao}</td>
              <td className="px-5 py-4">{entry.origem}</td>
              <td className="px-5 py-4">{formatDate(entry.created_at)}</td>
              <td className="px-5 py-4">{formatCurrency(entry.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
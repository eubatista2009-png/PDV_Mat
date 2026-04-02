import { formatCurrency } from '@/lib/format';
import type { Product } from '@/lib/types';

type StockTableProps = {
  products: Product[];
};

export function StockTable({ products }: StockTableProps) {
  return (
    <div className="surface overflow-hidden rounded-[28px] shadow-soft">
      <table className="min-w-full divide-y divide-ink/10 text-left">
        <thead className="bg-sand/80 text-sm text-ink/60">
          <tr>
            <th className="px-5 py-4 font-medium">Produto</th>
            <th className="px-5 py-4 font-medium">Categoria</th>
            <th className="px-5 py-4 font-medium">Estoque</th>
            <th className="px-5 py-4 font-medium">Minimo</th>
            <th className="px-5 py-4 font-medium">Preco venda</th>
            <th className="px-5 py-4 font-medium">Lucro unitario</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5 bg-white text-sm text-ink/75">
          {products.map((product) => {
            const lowStock = product.quantidade <= product.estoque_minimo;
            const profit = product.preco_venda - product.preco_custo;

            return (
              <tr key={product.id}>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{product.nome}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-ink/40">{product.codigo_barras}</p>
                  </div>
                </td>
                <td className="px-5 py-4">{product.categoria}</td>
                <td className="px-5 py-4">
                  <span className={lowStock ? 'font-semibold text-clay' : 'font-semibold text-forest'}>{product.quantidade}</span>
                </td>
                <td className="px-5 py-4">{product.estoque_minimo}</td>
                <td className="px-5 py-4">{formatCurrency(product.preco_venda)}</td>
                <td className="px-5 py-4">{formatCurrency(profit)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
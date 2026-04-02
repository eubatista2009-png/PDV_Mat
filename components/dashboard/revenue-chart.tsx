'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type RevenueChartProps = {
  revenue: Array<{ label: string; value: number }>;
  categories: Array<{ label: string; value: number }>;
};

export function RevenueChart({ revenue, categories }: RevenueChartProps) {
  const maxRevenue = Math.max(...revenue.map((item) => item.value), 0);
  const step = maxRevenue > 0 ? Math.ceil(maxRevenue / 5) : 100;

  const lowerBounds = revenue.map((item) => Math.floor(item.value / step) * step);
  const bandSizes = revenue.map((item, index) => Math.max(item.value - lowerBounds[index], 0));
  const bandColors = lowerBounds.map((bound) => {
    const level = step ? Math.min(Math.floor(bound / step), 4) : 0;
    const palette = ['#9ccfd1', '#61b7bc', '#2f9ca2', '#17757c', '#155e63'];
    return palette[level] ?? '#155e63';
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="surface rounded-[28px] p-6 shadow-soft">
        <div className="mb-5">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Faturamento por periodo em faixas</h3>
          <p className="text-sm text-ink/60">Cada barra representa a faixa atingida no periodo, destacando variacao de caixa.</p>
        </div>
        <Bar
          data={{
            labels: revenue.map((item) => item.label),
            datasets: [
              {
                label: 'Base da faixa',
                data: lowerBounds,
                stack: 'faixa',
                borderRadius: 0,
                backgroundColor: 'rgba(0,0,0,0)'
              },
              {
                label: 'Faturamento na faixa',
                data: bandSizes,
                stack: 'faixa',
                borderRadius: 999,
                backgroundColor: bandColors
              }
            ]
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const index = context.dataIndex;
                    const lower = lowerBounds[index] ?? 0;
                    const upper = lower + step;
                    const value = revenue[index]?.value ?? 0;
                    return `Faixa R$ ${lower.toFixed(0)} a R$ ${upper.toFixed(0)} | Faturamento: R$ ${value.toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              x: { stacked: true, grid: { display: false } },
              y: {
                stacked: true,
                grid: { color: 'rgba(23,23,23,0.06)' },
                ticks: {
                  callback: (value) => `R$ ${Number(value).toFixed(0)}`
                }
              }
            }
          }}
          className="h-[260px]"
        />
      </article>

      <article className="surface rounded-[28px] p-6 shadow-soft">
        <div className="mb-5">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Participacao por categoria</h3>
          <p className="text-sm text-ink/60">Leitura rapida do peso do estoque por frente de venda.</p>
        </div>
        <div className="mx-auto h-[260px] max-w-[260px]">
          <Doughnut
            data={{
              labels: categories.map((item) => item.label),
              datasets: [
                {
                  data: categories.map((item) => item.value),
                  backgroundColor: ['#df6d57', '#155e63', '#f2b84b', '#3f7d20', '#0d9488']
                }
              ]
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }}
          />
        </div>
      </article>
    </div>
  );
}
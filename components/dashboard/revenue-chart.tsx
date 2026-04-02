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
  const categoryColors = ['#df6d57', '#155e63', '#f2b84b', '#3f7d20', '#0d9488'];
  const totalCategories = categories.reduce((sum, item) => sum + item.value, 0);
  const topCategories = [...categories]
    .sort((left, right) => right.value - left.value)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      percent: totalCategories > 0 ? (item.value / totalCategories) * 100 : 0
    }));

  const lowerBounds = revenue.map((item) => Math.floor(item.value / step) * step);
  const bandSizes = revenue.map((item, index) => Math.max(item.value - lowerBounds[index], 0));
  const bandColors = lowerBounds.map((bound) => {
    const level = step ? Math.min(Math.floor(bound / step), 4) : 0;
    const palette = ['#9ccfd1', '#61b7bc', '#2f9ca2', '#17757c', '#155e63'];
    return palette[level] ?? '#155e63';
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="surface overflow-hidden rounded-[28px] p-6 shadow-soft">
        <div className="mb-5">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Faturamento por periodo em faixas</h3>
          <p className="text-sm text-ink/60">Cada barra representa a faixa atingida no periodo, destacando variacao de caixa.</p>
        </div>
        <div className="h-[260px] w-full overflow-hidden">
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
              indexAxis: 'y',
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
                x: {
                  stacked: true,
                  grid: { color: 'rgba(23,23,23,0.06)' },
                  ticks: {
                    callback: (value) => `R$ ${Number(value).toFixed(0)}`
                  }
                },
                y: {
                  stacked: true,
                  grid: { display: false }
                }
              }
            }}
            className="h-full w-full"
          />
        </div>
      </article>

      <article className="surface rounded-[28px] p-6 shadow-soft">
        <div className="mb-5">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Participacao por categoria</h3>
          <p className="text-sm text-ink/60">Ranking dos 5 grupos com maior participacao percentual.</p>
        </div>
        <div className="mx-auto h-[220px] max-w-[260px]">
          <Doughnut
            data={{
              labels: topCategories.map((item) => item.label),
              datasets: [
                {
                  data: topCategories.map((item) => item.value),
                  backgroundColor: categoryColors
                }
              ]
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }}
          />
        </div>

        <div className="mt-5 space-y-2">
          {topCategories.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm">
              <div className="flex items-center gap-2 text-ink/80">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[index] }} />
                <span className="font-medium">{index + 1}º {item.label}</span>
              </div>
              <span className="font-semibold text-ink">{item.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import type { Plugin } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const categoryValueLabelPlugin: Plugin<'bar'> = {
  id: 'categoryValueLabel',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const values = chart.data.datasets[0]?.data ?? [];

    ctx.save();
    ctx.font = '600 12px sans-serif';
    ctx.fillStyle = '#171717';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    meta.data.forEach((bar, index) => {
      const rawValue = values[index];
      const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
      ctx.fillText(`${value.toFixed(1)}%`, bar.x - 10, bar.y);
    });

    ctx.restore();
  }
};

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
  const maxCategoryPercent = Math.max(...topCategories.map((item) => item.percent), 0);

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
          <p className="text-sm text-ink/60">Top 5 categorias com percentual exibido diretamente no grafico.</p>
        </div>
        <div className="h-[260px] w-full">
          <Bar
            data={{
              labels: topCategories.map((item, index) => `${index + 1}º ${item.label}`),
              datasets: [
                {
                  data: topCategories.map((item) => item.percent),
                  backgroundColor: categoryColors,
                  borderRadius: 999,
                  borderSkipped: false,
                  barThickness: 18
                }
              ]
            }}
            options={{
              indexAxis: 'y',
              maintainAspectRatio: false,
              layout: {
                padding: { right: 18 }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `${Number(context.raw).toFixed(1)}%`
                  }
                }
              },
              scales: {
                x: {
                  display: false,
                  suggestedMax: Math.max(100, Math.ceil(maxCategoryPercent + 10))
                },
                y: {
                  grid: { display: false },
                  ticks: {
                    color: '#171717',
                    font: {
                      size: 12,
                      weight: 'bold'
                    }
                  }
                }
              }
            }}
            plugins={[categoryValueLabelPlugin]}
          />
        </div>
      </article>
    </div>
  );
}
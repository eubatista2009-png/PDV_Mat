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
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="surface rounded-[28px] p-6 shadow-soft">
        <div className="mb-5">
          <h3 className="font-[var(--font-heading)] text-xl text-ink">Faturamento por periodo</h3>
          <p className="text-sm text-ink/60">Evolucao recente do caixa para orientar mix e campanhas.</p>
        </div>
        <Bar
          data={{
            labels: revenue.map((item) => item.label),
            datasets: [
              {
                label: 'Faturamento',
                data: revenue.map((item) => item.value),
                borderRadius: 999,
                backgroundColor: '#155e63'
              }
            ]
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: { grid: { color: 'rgba(23,23,23,0.06)' } }
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
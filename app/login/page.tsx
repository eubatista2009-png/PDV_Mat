import { redirect } from 'next/navigation';
import { ArrowRight, BarChart3, ShoppingCart, Wallet } from 'lucide-react';

import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/auth';

const highlights = [
  {
    title: 'PDV em um clique',
    description: 'Venda, baixa de estoque e registro financeiro em um unico fluxo.'
  },
  {
    title: 'Operacao orientada por margem',
    description: 'Lucro estimado e alertas de ruptura para decidir sem planilhas.'
  },
  {
    title: 'SaaS pronto para escalar',
    description: 'Base com App Router, Supabase, Vercel e trilha para plano recorrente.'
  }
];

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative overflow-hidden bg-hero-grid px-6 py-10 lg:px-12 lg:py-14">
        <div className="surface-strong mx-auto flex h-full max-w-3xl flex-col justify-between rounded-[32px] p-8 shadow-soft lg:p-10">
          <div className="space-y-6">
            <span className="eyebrow text-xs text-forest">SaaS de operacao varejista</span>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-[var(--font-heading)] text-4xl leading-tight text-ink md:text-6xl">
                Frente de caixa, estoque e financeiro no mesmo pulso.
              </h1>
              <p className="max-w-xl text-lg text-ink/70">
                Uma base pronta para mini SaaS de loja: autenticacao, controle operacional e dashboards desenhados para vender mais e operar com menos atrito.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = [ShoppingCart, Wallet, BarChart3][index];

              return (
                <article key={item.title} className="surface rounded-3xl p-5 shadow-soft">
                  <Icon className="mb-4 h-5 w-5 text-clay" />
                  <h2 className="font-[var(--font-heading)] text-lg text-ink">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-3">
            <span className="eyebrow text-xs text-clay">Entrar na operacao</span>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-[var(--font-heading)] text-3xl text-ink">Acesse o painel</h2>
                <p className="mt-2 text-sm text-ink/65">Use Supabase Auth em producao ou entre em modo demo para validar a experiencia.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-forest" />
            </div>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
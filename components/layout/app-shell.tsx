import Link from 'next/link';
import type { Route } from 'next';
import { Activity, ChartPie, LayoutDashboard, PackageSearch, ShoppingBasket, Wallet2 } from 'lucide-react';

import { logoutAction } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pdv', label: 'PDV', icon: ShoppingBasket },
  { href: '/estoque', label: 'Estoque', icon: PackageSearch },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet2, adminOnly: true },
  { href: '/relatorios', label: 'Relatorios', icon: ChartPie, adminOnly: true }
];

type AppShellProps = {
  title: string;
  description: string;
  pathname: string;
  email: string;
  role: UserRole;
  demo: boolean;
  children: React.ReactNode;
};

export function AppShell({ title, description, pathname, email, role, demo, children }: AppShellProps) {
  return (
    <div className="min-h-screen px-6 py-6">
      <div className="grid min-h-[calc(100vh-48px)] w-full items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="surface flex rounded-[28px] p-5 shadow-soft lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:flex-col lg:self-start lg:overflow-y-auto">
          <div>
            <span className="eyebrow text-xs text-clay">PDV Mat</span>
            <h1 className="mt-3 font-[var(--font-heading)] text-2xl text-ink">Operacao da loja</h1>
            <p className="mt-2 text-sm text-ink/65">SaaS base para frente de caixa, estoque e gestao financeira.</p>
          </div>

          <nav className="mt-8 space-y-2">
            {links
              .filter((link) => !link.adminOnly || role === 'admin')
              .map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href as Route}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                      active ? 'bg-ink text-white' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          <div className="mt-8 rounded-3xl bg-forest px-4 py-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4" />
              {demo ? 'Modo demonstracao' : 'Sessao autenticada'}
            </div>
            <p className="mt-2 text-sm text-white/80">{email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/60">{role}</p>
          </div>

          <form action={logoutAction} className="mt-6">
            <Button type="submit" variant="ghost" className="w-full justify-center border border-ink/10">
              Encerrar sessao
            </Button>
          </form>
        </aside>

        <section className="min-w-0 space-y-4">
          <header className="surface flex flex-col gap-4 rounded-[28px] p-6 shadow-soft md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow text-xs text-forest">Painel operacional</span>
              <h2 className="mt-2 font-[var(--font-heading)] text-3xl text-ink">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink/65">{description}</p>
            </div>

            <div className="rounded-3xl bg-sand px-4 py-4 text-sm text-ink/75">
              <p className="font-semibold text-ink">Pronto para monetizacao</p>
              <p className="mt-1">Free com limite de 100 vendas. Pro e Premium podem ser adicionados via Stripe ou integração recorrente.</p>
            </div>
          </header>

          {children}
        </section>
      </div>
    </div>
  );
}
import type { Metadata } from 'next';
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google';

import '@/app/globals.css';

const heading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading'
});

const body = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'PDV Mat SaaS',
  description: 'Operacao de frente de caixa, estoque e financeiro em um unico painel.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${heading.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
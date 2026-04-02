import { AppShell } from '@/components/layout/app-shell';
import { PdvTerminal } from '@/components/pdv/pdv-terminal';
import { requireUser } from '@/lib/auth';
import { listProdutos } from '@/services/catalogo-service';

export default async function PdvPage() {
  const user = await requireUser();
  const products = await listProdutos();

  return (
    <AppShell
      title="Frente de caixa"
      description="Selecione o produto, feche a venda e baixe o estoque com o mesmo gesto operacional."
      pathname="/pdv"
      email={user.email}
      role={user.role}
      demo={user.demo}
    >
      <PdvTerminal products={products} />
    </AppShell>
  );
}
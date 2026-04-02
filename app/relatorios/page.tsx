import { AppShell } from '@/components/layout/app-shell';
import { ReportPanel } from '@/components/relatorios/report-panel';
import { requireAdmin } from '@/lib/auth';
import { getReportData } from '@/services/dashboard-service';

export default async function RelatoriosPage() {
  const user = await requireAdmin();
  const report = await getReportData();

  return (
    <AppShell
      title="Relatorios gerenciais"
      description="Leitura executiva para acompanhar crescimento, ticket medio e produtos mais vendidos."
      pathname="/relatorios"
      email={user.email}
      role={user.role}
      demo={user.demo}
    >
      <ReportPanel report={report} />
    </AppShell>
  );
}
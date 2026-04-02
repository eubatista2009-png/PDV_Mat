'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { entradaPorCodigoBarrasAction, importEstoquePlanilhaAction, importarNotaFiscalXmlAction } from '@/app/estoque/actions';
import { Button } from '@/components/ui/button';

type StockImportPanelProps = {
  isAdmin: boolean;
};

export function StockImportPanel({ isAdmin }: StockImportPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [planilhaMsg, setPlanilhaMsg] = useState<string | null>(null);
  const [planilhaOk, setPlanilhaOk] = useState(false);
  const [xmlMsg, setXmlMsg] = useState<string | null>(null);
  const [xmlOk, setXmlOk] = useState(false);
  const [barcodeMsg, setBarcodeMsg] = useState<string | null>(null);
  const [barcodeOk, setBarcodeOk] = useState(false);

  const handlePlanilhaSubmit = (formData: FormData) => {
    setPlanilhaMsg(null);

    startTransition(async () => {
      const result = await importEstoquePlanilhaAction(formData);
      setPlanilhaOk(result.ok);
      setPlanilhaMsg(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  };

  const handleBarcodeSubmit = (formData: FormData) => {
    setBarcodeMsg(null);

    startTransition(async () => {
      const result = await entradaPorCodigoBarrasAction(formData);
      setBarcodeOk(result.ok);
      setBarcodeMsg(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  };

  const handleXmlSubmit = (formData: FormData) => {
    setXmlMsg(null);

    startTransition(async () => {
      const result = await importarNotaFiscalXmlAction(formData);
      setXmlOk(result.ok);
      setXmlMsg(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <article className="surface rounded-[28px] p-6 shadow-soft">
        <h3 className="font-[var(--font-heading)] text-xl text-ink">Importacao por planilha</h3>
        <p className="mt-2 text-sm text-ink/65">
          Envie um arquivo Excel (.xlsx, .xls) ou CSV com os campos obrigatorios para cadastrar ou atualizar produtos por codigo de barras.
        </p>

        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-xs text-ink/70">
          <p>Campos obrigatorios: nome, categoria, preco_custo, preco_venda, quantidade, estoque_minimo, codigo_barras.</p>
          <p className="mt-1">Campo opcional para compatibilidade fiscal: ncm.</p>
        </div>

        <form action={handlePlanilhaSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Arquivo da planilha</label>
            <input
              type="file"
              name="planilha"
              accept=".xlsx,.xls,.csv"
              disabled={!isAdmin || isPending}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-ink file:px-3 file:py-2 file:text-white"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!isAdmin || isPending}>
            {isPending ? 'Processando importacao...' : 'Importar planilha'}
          </Button>

          {planilhaMsg && (
            <p className={`rounded-2xl px-4 py-3 text-sm ${planilhaOk ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>
              {planilhaMsg}
            </p>
          )}

          {!isAdmin && (
            <p className="text-sm text-clay">Somente usuarios admin podem importar produtos no estoque.</p>
          )}
        </form>
      </article>

      <article className="surface rounded-[28px] p-6 shadow-soft">
        <h3 className="font-[var(--font-heading)] text-xl text-ink">Entrada por XML do fornecedor</h3>
        <p className="mt-2 text-sm text-ink/65">
          Envie o XML da NF-e de compra para cadastrar ou atualizar produtos automaticamente com quantidade e custo.
        </p>

        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-xs text-ink/70">
          <p>Leitura de itens da NF-e: descricao, GTIN/EAN, NCM, quantidade e valor unitario.</p>
          <p className="mt-1">Sem GTIN, o sistema gera um codigo interno baseado no numero da nota e no codigo do fornecedor.</p>
        </div>

        <form action={handleXmlSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Arquivo XML da NF-e</label>
            <input
              type="file"
              name="xml_nota"
              accept=".xml,text/xml,application/xml"
              disabled={!isAdmin || isPending}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-ink file:px-3 file:py-2 file:text-white"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!isAdmin || isPending}>
            {isPending ? 'Processando XML...' : 'Importar XML da nota'}
          </Button>

          {xmlMsg && (
            <p className={`rounded-2xl px-4 py-3 text-sm ${xmlOk ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>
              {xmlMsg}
            </p>
          )}
        </form>
      </article>

      <article className="surface rounded-[28px] p-6 shadow-soft">
        <h3 className="font-[var(--font-heading)] text-xl text-ink">Entrada por codigo de barras</h3>
        <p className="mt-2 text-sm text-ink/65">
          Use leitor de codigo de barras (ou digitacao manual) para adicionar rapidamente quantidade a um produto ja existente.
        </p>

        <form action={handleBarcodeSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Codigo de barras</label>
            <input
              name="codigo_barras"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ex: 7891234567890"
              disabled={!isAdmin || isPending}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Quantidade de entrada</label>
            <input
              type="number"
              min={1}
              step={1}
              name="quantidade_entrada"
              placeholder="Ex: 20"
              disabled={!isAdmin || isPending}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!isAdmin || isPending}>
            {isPending ? 'Registrando entrada...' : 'Registrar entrada'}
          </Button>

          {barcodeMsg && (
            <p className={`rounded-2xl px-4 py-3 text-sm ${barcodeOk ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>
              {barcodeMsg}
            </p>
          )}

          {!isAdmin && (
            <p className="text-sm text-clay">Somente usuarios admin podem registrar entrada por codigo de barras.</p>
          )}
        </form>
      </article>
    </div>
  );
}

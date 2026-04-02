'use client';

import { useDeferredValue, useState } from 'react';
import { Minus, Plus, ScanBarcode, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/lib/types';

type CartLine = {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  estoque: number;
};

type PdvTerminalProps = {
  products: Product[];
};

export function PdvTerminal({ products }: PdvTerminalProps) {
  const [query, setQuery] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const filteredProducts = products.filter((product) => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) {
      return true;
    }

    return (
      product.nome.toLowerCase().includes(value) ||
      product.categoria.toLowerCase().includes(value) ||
      product.codigo_barras.includes(value)
    );
  });

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const prioritizedProducts = [...filteredProducts].sort((left, right) => {
    if (!normalizedQuery) {
      return left.nome.localeCompare(right.nome);
    }

    const leftNameStarts = left.nome.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
    const rightNameStarts = right.nome.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;

    if (leftNameStarts !== rightNameStarts) {
      return rightNameStarts - leftNameStarts;
    }

    const leftBarcodeStarts = left.codigo_barras.startsWith(normalizedQuery) ? 1 : 0;
    const rightBarcodeStarts = right.codigo_barras.startsWith(normalizedQuery) ? 1 : 0;

    if (leftBarcodeStarts !== rightBarcodeStarts) {
      return rightBarcodeStarts - leftBarcodeStarts;
    }

    return left.nome.localeCompare(right.nome);
  });

  const visibleProducts = normalizedQuery ? prioritizedProducts.slice(0, 12) : prioritizedProducts.slice(0, 16);

  const total = cart.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  function addToCart(product: Product) {
    if (product.quantidade <= 0) {
      setFeedback(`Sem estoque para ${product.nome}.`);
      return;
    }

    setFeedback(null);
    setCart((current) => {
      const existing = current.find((item) => item.produtoId === product.id);

      if (!existing) {
        return [
          ...current,
          {
            produtoId: product.id,
            nome: product.nome,
            preco: product.preco_venda,
            quantidade: 1,
            estoque: product.quantidade
          }
        ];
      }

      if (existing.quantidade >= existing.estoque) {
        setFeedback(`Quantidade maxima disponivel para ${product.nome}.`);
        return current;
      }

      return current.map((item) =>
        item.produtoId === product.id ? { ...item, quantidade: item.quantidade + 1 } : item
      );
    });
  }

  function changeQuantity(produtoId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.produtoId !== produtoId) {
            return item;
          }

          const quantidade = Math.max(0, Math.min(item.estoque, item.quantidade + delta));
          return { ...item, quantidade };
        })
        .filter((item) => item.quantidade > 0)
    );
  }

  async function finalizeSale() {
    if (!cart.length) {
      setFeedback('Adicione ao menos um item ao carrinho.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formaPagamento,
          items: cart.map((item) => ({
            produtoId: item.produtoId,
            nome: item.nome,
            quantidade: item.quantidade,
            preco: item.preco
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Falha ao concluir a venda.');
      }

      setFeedback(`${data.message} Total ${formatCurrency(data.total)}.`);
      setCart([]);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao concluir a venda.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="surface space-y-5 rounded-[28px] p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-[var(--font-heading)] text-2xl text-ink">Frente de caixa</h3>
            <p className="text-sm text-ink/60">Busque por nome, categoria ou codigo de barras e monte a venda em segundos.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-sand px-4 py-3 text-sm text-ink/70">
            <ScanBarcode className="h-4 w-4 text-clay" />
            Leitura pronta para codigo de barras
          </div>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar produto ou escanear codigo"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest"
        />

        <div className="rounded-[28px] border border-ink/10 bg-white">
          <div className="grid grid-cols-[minmax(0,1.6fr)_0.9fr_0.7fr_0.9fr_auto] gap-3 border-b border-ink/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink/45">
            <span>Item</span>
            <span>Categoria</span>
            <span>Estoque</span>
            <span>Preco</span>
            <span className="text-right">Acao</span>
          </div>

          <div className="divide-y divide-ink/10">
            {visibleProducts.length ? (
              visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[minmax(0,1.6fr)_0.9fr_0.7fr_0.9fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-sand/45"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{product.nome}</p>
                    <p className="truncate text-xs text-ink/45">Cod. {product.codigo_barras}</p>
                  </div>
                  <p className="truncate text-sm text-ink/65">{product.categoria}</p>
                  <span className="text-sm font-semibold text-forest">{product.quantidade}</span>
                  <span className="text-sm font-semibold text-ink">{formatCurrency(product.preco_venda)}</span>
                  <Button type="button" className="px-3 py-2 text-xs" onClick={() => addToCart(product)}>
                    Adicionar
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-ink/55">Nenhum item encontrado para a busca informada.</div>
            )}
          </div>
        </div>
      </section>

      <aside className="surface flex flex-col rounded-[28px] p-6 shadow-soft">
        <div className="rounded-[28px] bg-ink p-5 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-[var(--font-heading)] text-2xl">Carrinho atual</h3>
                <p className="text-sm text-white/65">Nao permite finalizar sem saldo disponivel em estoque.</p>
              </div>
              <select
                value={formaPagamento}
                onChange={(event) => setFormaPagamento(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/95 px-3 py-2 text-sm text-ink outline-none"
              >
                <option value="pix">PIX</option>
                <option value="cartao">Cartao</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/65">Total da venda</p>
                <p className="mt-2 font-[var(--font-heading)] text-4xl">{formatCurrency(total)}</p>
              </div>
              <Button type="button" variant="secondary" className="min-w-[180px]" disabled={submitting} onClick={finalizeSale}>
                {submitting ? 'Processando venda...' : 'Finalizar venda'}
              </Button>
            </div>

            {feedback && <p className="text-sm text-white/80">{feedback}</p>}
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-3">
          {cart.length ? (
            cart.map((item, index) => (
              <div key={item.produtoId} className="rounded-3xl border border-ink/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-ink/40">Item {index + 1}</p>
                    <h4 className="font-semibold text-ink">{item.nome}</h4>
                    <p className="mt-1 text-sm text-ink/55">{formatCurrency(item.preco)} por unidade</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.produtoId, -item.quantidade)}
                    className="rounded-full p-2 text-ink/45 transition hover:bg-ink/5 hover:text-clay"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-ink/10 px-2 py-1">
                    <button type="button" onClick={() => changeQuantity(item.produtoId, -1)} className="rounded-full p-1 hover:bg-ink/5">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">{item.quantidade}</span>
                    <button type="button" onClick={() => changeQuantity(item.produtoId, 1)} className="rounded-full p-1 hover:bg-ink/5">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-semibold text-ink">{formatCurrency(item.preco * item.quantidade)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-ink/15 px-4 py-10 text-center text-sm text-ink/55">
              Nenhum item selecionado.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
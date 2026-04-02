import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { checkoutVenda } from '@/services/vendas-service';

const checkoutSchema = z.object({
  formaPagamento: z.string().min(1),
  items: z
    .array(
      z.object({
        produtoId: z.string().min(1),
        nome: z.string().min(1),
        quantidade: z.number().int().positive(),
        preco: z.number().positive()
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload invalido.' }, { status: 400 });
  }

  try {
    const result = await checkoutVenda(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao finalizar venda.' },
      { status: 422 }
    );
  }
}
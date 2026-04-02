'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getSupabaseServerClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().email('Informe um email valido.'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres.'),
  role: z.enum(['admin', 'operator'])
});

export type LoginInput = z.infer<typeof loginSchema>;

export async function loginAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const cookieStore = cookies();
    cookieStore.set('demo-auth', 'true', { httpOnly: true, path: '/' });
    cookieStore.set('demo-role', parsed.data.role, { httpOnly: true, path: '/' });
    redirect('/dashboard');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return { error: 'Nao foi possivel autenticar. Verifique suas credenciais.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete('demo-auth');
  cookieStore.delete('demo-role');

  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect('/login');
}
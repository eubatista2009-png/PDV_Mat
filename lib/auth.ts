import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthUser, UserRole } from '@/lib/types';

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const demoAuth = cookieStore.get('demo-auth')?.value === 'true';
  const demoRole = (cookieStore.get('demo-role')?.value as UserRole | undefined) ?? 'admin';

  if (demoAuth) {
    return {
      email: 'demo@pdvsaas.com',
      role: demoRole,
      demo: true
    };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  // Lê o papel da tabela profiles, que é o source-of-truth para RLS.
  // app_metadata.role não é consultável a partir do browser sem service_role.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = (profile?.role as UserRole | undefined) ?? 'operator';

  return {
    email: user.email,
    role,
    demo: false
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return user;
}
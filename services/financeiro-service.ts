import 'server-only';

import { demoFinanceEntries } from '@/lib/demo-data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { FinancialEntry } from '@/lib/types';

export async function listFinanceiro(): Promise<FinancialEntry[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return demoFinanceEntries;
  }

  const { data, error } = await supabase.from('financeiro').select('*').order('created_at', { ascending: false });

  if (error || !data) {
    return demoFinanceEntries;
  }

  return data;
}
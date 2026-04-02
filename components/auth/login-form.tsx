'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { loginAction, type LoginInput } from '@/app/login/actions';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Informe um email valido.'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres.'),
  role: z.enum(['admin', 'operator'])
});

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'demo@pdvsaas.com',
      password: '123456',
      role: 'admin'
    }
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="surface space-y-5 rounded-[28px] p-6 shadow-soft">
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
        <input
          {...register('email')}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest"
          placeholder="voce@empresa.com"
        />
        {errors.email && <p className="mt-2 text-sm text-clay">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Senha</label>
        <input
          type="password"
          {...register('password')}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest"
          placeholder="Sua senha"
        />
        {errors.password && <p className="mt-2 text-sm text-clay">{errors.password.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">Perfil de acesso</label>
        <select
          {...register('role')}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-forest"
        >
          <option value="admin">Admin</option>
          <option value="operator">Operador de caixa</option>
        </select>
      </div>

      {serverError && <p className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Entrando...' : 'Entrar no painel'}
      </Button>

      <p className="text-sm leading-6 text-ink/60">
        Sem variaveis do Supabase, a aplicacao entra em modo demo para validar navegacao e experiencia do produto.
      </p>
    </form>
  );
}
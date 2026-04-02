-- ============================================================
-- PDV Mat SaaS – Schema de producao
-- Execute este arquivo inteiro no SQL Editor do Supabase.
-- O script e idempotente: pode ser re-executado sem erro.
-- ============================================================

-- --------------------------------------------------------
-- Extensoes
-- --------------------------------------------------------
create extension if not exists pgcrypto;

-- --------------------------------------------------------
-- Funcao: cria perfil automaticamente ao cadastrar usuario
-- --------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'operator')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- --------------------------------------------------------
-- Tabelas
-- --------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('admin', 'operator')) default 'operator',
  created_at timestamp with time zone default now()
);

create table if not exists produtos (
  id             uuid    primary key default gen_random_uuid(),
  nome           text    not null,
  categoria      text    not null,
  preco_custo    numeric not null check (preco_custo >= 0),
  preco_venda    numeric not null check (preco_venda >= 0),
  quantidade     integer not null default 0 check (quantidade >= 0),
  estoque_minimo integer not null default 0 check (estoque_minimo >= 0),
  codigo_barras  text    unique,
  created_at     timestamp with time zone default now()
);

create index if not exists idx_produtos_codigo_barras on produtos (codigo_barras);
create index if not exists idx_produtos_categoria     on produtos (categoria);

create table if not exists vendas (
  id              uuid    primary key default gen_random_uuid(),
  total           numeric not null check (total >= 0),
  forma_pagamento text    not null,
  created_at      timestamp with time zone default now()
);

create index if not exists idx_vendas_created_at on vendas (created_at desc);

create table if not exists itens_venda (
  id         uuid    primary key default gen_random_uuid(),
  venda_id   uuid    not null references vendas(id)   on delete cascade,
  produto_id uuid    not null references produtos(id),
  quantidade integer not null check (quantidade > 0),
  preco      numeric not null check (preco >= 0)
);

create index if not exists idx_itens_venda_venda_id   on itens_venda (venda_id);
create index if not exists idx_itens_venda_produto_id on itens_venda (produto_id);

create table if not exists financeiro (
  id         uuid    primary key default gen_random_uuid(),
  tipo       text    not null check (tipo in ('entrada', 'saida')),
  valor      numeric not null check (valor >= 0),
  descricao  text    not null,
  origem     text    not null check (origem in ('venda', 'manual')),
  created_at timestamp with time zone default now()
);

create index if not exists idx_financeiro_tipo       on financeiro (tipo);
create index if not exists idx_financeiro_created_at on financeiro (created_at desc);

-- --------------------------------------------------------
-- Trigger: profile automatico ao registrar usuario
-- --------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --------------------------------------------------------
-- Funcao: finalizar_venda
-- Atomica: valida estoque → baixa estoque → cria venda →
--          insere itens → lanca financeiro.
-- SECURITY DEFINER: bypassa RLS para que operadores consigam
-- finalizar vendas sem permissao direta nas tabelas internas.
-- --------------------------------------------------------
create or replace function public.finalizar_venda(
  itens_input           jsonb,
  forma_pagamento_input text
)
returns table (id uuid, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  venda_id    uuid;
  venda_total numeric := 0;
  item        jsonb;
  produto_row produtos%rowtype;
begin
  if jsonb_array_length(itens_input) = 0 then
    raise exception 'Nenhum item informado para a venda.';
  end if;

  for item in select * from jsonb_array_elements(itens_input)
  loop
    select * into produto_row
    from produtos p
    where p.id = (item->>'produto_id')::uuid
    for update;

    if not found then
      raise exception 'Produto nao encontrado: %', item->>'produto_id';
    end if;

    if produto_row.quantidade < (item->>'quantidade')::int then
      raise exception 'Estoque insuficiente para: %', produto_row.nome;
    end if;

    update produtos
    set quantidade = quantidade - (item->>'quantidade')::int
    where id = produto_row.id;

    venda_total := venda_total
      + (item->>'preco')::numeric * (item->>'quantidade')::int;
  end loop;

  insert into vendas (total, forma_pagamento)
  values (venda_total, forma_pagamento_input)
  returning vendas.id into venda_id;

  for item in select * from jsonb_array_elements(itens_input)
  loop
    insert into itens_venda (venda_id, produto_id, quantidade, preco)
    values (
      venda_id,
      (item->>'produto_id')::uuid,
      (item->>'quantidade')::int,
      (item->>'preco')::numeric
    );
  end loop;

  insert into financeiro (tipo, valor, descricao, origem)
  values ('entrada', venda_total, 'Venda #' || venda_id::text, 'venda');

  return query select venda_id, venda_total;
end;
$$;

-- --------------------------------------------------------
-- Funcao utilitaria: promover usuario a admin
-- Uso: select promote_to_admin('<uuid-do-usuario>');
-- Chamada somente pela service_role (ex: script de setup).
-- --------------------------------------------------------
create or replace function public.promote_to_admin(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, role)
  values (target_id, 'admin')
  on conflict (id) do update set role = 'admin';
end;
$$;

revoke execute on function public.promote_to_admin(uuid)
  from public, anon, authenticated;

-- --------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------
alter table profiles    enable row level security;
alter table produtos    enable row level security;
alter table vendas      enable row level security;
alter table itens_venda enable row level security;
alter table financeiro  enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles: usuario le proprio perfil" on profiles;
drop policy if exists "profiles: admin le todos os perfis"  on profiles;
drop policy if exists "profiles: admin atualiza perfis"     on profiles;

create policy "profiles: usuario le proprio perfil"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles: admin le todos os perfis"
  on profiles for select
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles: admin atualiza perfis"
  on profiles for update
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---------- produtos ----------
drop policy if exists "produtos: autenticado consulta" on produtos;
drop policy if exists "produtos: admin gerencia"       on produtos;

create policy "produtos: autenticado consulta"
  on produtos for select
  to authenticated
  using (true);

create policy "produtos: admin gerencia"
  on produtos for all
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---------- vendas ----------
-- Inserts ocorrem via SECURITY DEFINER (finalizar_venda); operators
-- nao precisam de policy de INSERT direta.
drop policy if exists "vendas: autenticado consulta" on vendas;

create policy "vendas: autenticado consulta"
  on vendas for select
  to authenticated
  using (true);

-- ---------- itens_venda ----------
drop policy if exists "itens_venda: autenticado consulta" on itens_venda;

create policy "itens_venda: autenticado consulta"
  on itens_venda for select
  to authenticated
  using (true);

-- ---------- financeiro ----------
drop policy if exists "financeiro: admin consulta" on financeiro;
drop policy if exists "financeiro: admin gerencia" on financeiro;

create policy "financeiro: admin consulta"
  on financeiro for select
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "financeiro: admin gerencia"
  on financeiro for all
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

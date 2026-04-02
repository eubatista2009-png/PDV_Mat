-- ============================================================
-- PDV Mat SaaS – Seed inicial
-- Execute APOS rodar schema.sql
-- ============================================================

-- --------------------------------------------------------
-- Catalogo de produtos demo
-- UUIDs fixos para que referências externas sejam estaveis
-- --------------------------------------------------------
insert into produtos (id, nome, categoria, preco_custo, preco_venda, quantidade, estoque_minimo, codigo_barras)
values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Café Especial 250g',       'Mercearia',    17.40, 29.90, 18, 8,  '7891000000001'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Bolo de Fubá Caseiro',    'Padaria',       8.20, 16.50,  5, 6,  '7891000000002'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Queijo Minas Frescal',    'Frios',        19.50, 31.90, 12, 4,  '7891000000003'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Suco Integral Uva 1L',    'Bebidas',       9.80, 15.90, 27, 10, '7891000000004'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Chocolate 70% Cacau 80g', 'Conveniência',  6.20, 12.90,  9, 5,  '7891000000005'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Biscoito Integral 200g',  'Mercearia',     3.80,  7.50, 31, 10, '7891000000006'),
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Água Mineral 500ml',      'Bebidas',       0.90,  2.50, 60, 20, '7891000000007'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Pão Artesanal 400g',      'Padaria',       4.50,  9.90, 14, 6,  '7891000000008'),
  ('a1b2c3d4-0009-0009-0009-000000000009', 'Manteiga Extra 200g',     'Frios',         8.90, 14.90,  8, 4,  '7891000000009'),
  ('a1b2c3d4-0010-0010-0010-000000000010', 'Granola Premium 500g',    'Mercearia',    12.00, 22.90, 20, 8,  '7891000000010')
on conflict (id) do nothing;

-- --------------------------------------------------------
-- Como criar o primeiro admin
--
-- 1. Crie o usuario no Supabase Dashboard:
--    Authentication → Users → Invite User
--    (ou use o form de login com email confirmado)
--
-- 2. Copie o UUID do usuario recem-criado e execute:
--    select promote_to_admin('<uuid-do-usuario>');
--
--    Exemplo:
--    select promote_to_admin('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
--
-- 3. O trigger on_auth_user_created ja cria o perfil com
--    role='operator'. A funcao promote_to_admin altera para
--    role='admin' de forma idempotente.
--
-- NOTA: promote_to_admin so pode ser chamada pelo service_role.
--       Use o SQL Editor do Supabase (que roda como service_role).
-- --------------------------------------------------------

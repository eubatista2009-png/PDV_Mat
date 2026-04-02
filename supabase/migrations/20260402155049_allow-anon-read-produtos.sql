-- Permite leitura de produtos sem sessao autenticada para evitar tela vazia no estoque.
drop policy if exists "produtos: anon consulta" on public.produtos;

create policy "produtos: anon consulta"
  on public.produtos for select
  to anon
  using (true);

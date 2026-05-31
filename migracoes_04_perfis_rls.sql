-- ============================================================
-- Migração 04: Controle de acesso por papel (admin / user)
-- Já aplicada no Supabase via MCP. Mantida aqui para histórico.
-- ============================================================

-- 1) Tabela de perfis (papel por usuário)
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz default now()
);

alter table public.perfis enable row level security;

-- 2) Função is_admin() — security definer evita recursão de RLS na própria perfis
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from public.perfis where id = auth.uid() and role = 'admin');
$$;

-- 3) Trigger: cria o perfil automaticamente no cadastro de um novo usuário do Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.perfis (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Policies de perfis
drop policy if exists perfis_select on public.perfis;
create policy perfis_select on public.perfis for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists perfis_update on public.perfis;
create policy perfis_update on public.perfis for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists perfis_insert on public.perfis;
create policy perfis_insert on public.perfis for insert
  with check (public.is_admin());
drop policy if exists perfis_delete on public.perfis;
create policy perfis_delete on public.perfis for delete
  using (public.is_admin());

-- 5) Backfill dos usuários existentes + define o admin
insert into public.perfis (id, email, role)
select id, email, 'user' from auth.users
on conflict (id) do nothing;
update public.perfis set role = 'admin' where email = 'recheraphael@gmail.com';

-- 6) Escrita só admin em epi / funcionarios / setores (leitura para qualquer autenticado)
drop policy if exists epi_insert on public.epi;
create policy epi_insert on public.epi for insert with check (public.is_admin());
drop policy if exists epi_update on public.epi;
create policy epi_update on public.epi for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists epi_delete on public.epi;
create policy epi_delete on public.epi for delete using (public.is_admin());

drop policy if exists funcionarios_insert on public.funcionarios;
create policy funcionarios_insert on public.funcionarios for insert with check (public.is_admin());
drop policy if exists funcionarios_update on public.funcionarios;
create policy funcionarios_update on public.funcionarios for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists funcionarios_delete on public.funcionarios;
create policy funcionarios_delete on public.funcionarios for delete using (public.is_admin());

drop policy if exists setores_insert on public.setores;
create policy setores_insert on public.setores for insert with check (public.is_admin());
drop policy if exists setores_update on public.setores;
create policy setores_update on public.setores for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists setores_delete on public.setores;
create policy setores_delete on public.setores for delete using (public.is_admin());

-- 7) estoque: UPDATE/DELETE só admin. INSERT segue liberado para autenticado,
--    pois Entregas e Devoluções (ações de usuário) lançam movimentações automáticas.
drop policy if exists estoque_update on public.estoque;
create policy estoque_update on public.estoque for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists estoque_delete on public.estoque;
create policy estoque_delete on public.estoque for delete using (public.is_admin());

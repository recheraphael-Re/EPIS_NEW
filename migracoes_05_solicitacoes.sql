-- ============================================================
-- Migração 05: Solicitação de EPIs (user pede, admin aprova → entrega)
-- Já aplicada no Supabase via MCP. Mantida aqui para histórico.
-- ============================================================

-- 1) Tabela de solicitações
create table if not exists public.solicitacoes (
  id uuid primary key default extensions.uuid_generate_v4(),
  funcionario_id uuid not null references public.funcionarios(id),
  epi_id uuid not null references public.epi(id),
  quantidade integer not null default 1 check (quantidade > 0),
  status text not null default 'pendente'
    check (status in ('pendente','aprovada','rejeitada')),
  solicitante_email text,
  observacao text,
  decidido_por text,
  decidido_em timestamptz,
  created_at timestamptz default now()
);

alter table public.solicitacoes enable row level security;

-- 2) Policies
--    Leitura liberada para autenticados
drop policy if exists solicitacoes_select_auth on public.solicitacoes;
create policy solicitacoes_select_auth on public.solicitacoes for select
  to authenticated using (true);

--    Insert liberado para autenticados, mas apenas como 'pendente'
drop policy if exists solicitacoes_insert_auth on public.solicitacoes;
create policy solicitacoes_insert_auth on public.solicitacoes for insert
  to authenticated with check (status = 'pendente');

--    Aprovar/rejeitar (update) e excluir só admin
drop policy if exists solicitacoes_update_admin on public.solicitacoes;
create policy solicitacoes_update_admin on public.solicitacoes for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists solicitacoes_delete_admin on public.solicitacoes;
create policy solicitacoes_delete_admin on public.solicitacoes for delete
  to authenticated using (public.is_admin());

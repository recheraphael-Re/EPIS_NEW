-- ============================================================
--  SafeEPI - Script de criacao do banco (PostgreSQL / Supabase)
--  Modelo logico correspondente ao DER (docs/diagrama-5-der.html)
--  Gerado a partir do schema real do projeto.
-- ============================================================

-- Extensao usada para gerar UUIDs (ja habilitada no Supabase)
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- SETORES : setores/areas da empresa
-- ------------------------------------------------------------
create table setores (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null unique,
  descricao   text,
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------
-- FUNCIONARIOS : colaboradores que recebem EPIs
--   OBS: 'setor' e texto (nao FK). Para vincular de verdade,
--        trocar por: setor_id uuid references setores(id)
-- ------------------------------------------------------------
create table funcionarios (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  matricula   text not null unique,
  setor       text not null,
  cargo       text not null,
  ativo       boolean not null default true,
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------
-- EPI : catalogo de equipamentos de protecao individual
-- ------------------------------------------------------------
create table epi (
  id            uuid primary key default uuid_generate_v4(),
  nome          text not null,
  ca            text,                 -- numero do Certificado de Aprovacao
  validade      date,                 -- validade do CA
  validade_epi  date,                 -- validade do proprio EPI (opcional)
  quantidade    integer not null default 0,
  ativo         boolean not null default true,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- ESTOQUE : movimentacoes de estoque de cada EPI
-- ------------------------------------------------------------
create table estoque (
  id            uuid primary key default uuid_generate_v4(),
  epi_id        uuid not null references epi(id),
  tipo          text not null check (tipo in ('entrada','saida','baixa')),
  quantidade    integer not null check (quantidade > 0),
  data          date not null default current_date,
  motivo        text,
  observacao    text,
  usuario_email text,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- ENTREGAS : entidade associativa FUNCIONARIO N:N EPI (entrega)
-- ------------------------------------------------------------
create table entregas (
  id                  uuid primary key default uuid_generate_v4(),
  funcionario_id      uuid not null references funcionarios(id),
  epi_id              uuid not null references epi(id),
  quantidade_entregue integer not null default 1,
  data                date not null default current_date,
  assinatura_digital  boolean not null default false,
  created_at          timestamptz default now()
);

-- ------------------------------------------------------------
-- DEVOLUCOES : entidade associativa FUNCIONARIO N:N EPI (devolucao)
-- ------------------------------------------------------------
create table devolucoes (
  id              uuid primary key default uuid_generate_v4(),
  funcionario_id  uuid not null references funcionarios(id),
  epi_id          uuid not null references epi(id),
  quantidade      integer not null check (quantidade > 0),
  condicao        text not null check (condicao in ('reutilizavel','descarte')),
  data            date not null default current_date,
  observacao      text,
  usuario_email   text,
  created_at      timestamptz default now()
);

-- ------------------------------------------------------------
-- PERFIS : controle de acesso (admin/user), ligado ao Supabase Auth
-- ------------------------------------------------------------
create table perfis (
  id          uuid primary key references auth.users(id),
  email       text,
  role        text not null default 'user' check (role in ('admin','user')),
  created_at  timestamptz default now()
);

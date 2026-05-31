-- ============================================================
-- Migração 02: Exclusão lógica (inativação) de EPIs e funcionários
-- Rodar no SQL Editor do Supabase ANTES de subir o código novo
-- ============================================================

-- Coluna "ativo": registros inativados deixam de aparecer nas
-- listas/contagens, mas o histórico (entregas, estoque) é preservado.
ALTER TABLE epi
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

ALTER TABLE funcionarios
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Índices para acelerar os filtros por "ativo"
CREATE INDEX IF NOT EXISTS idx_epi_ativo          ON epi (ativo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON funcionarios (ativo);

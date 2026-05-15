-- ============================================================
-- Migração: Baixa de estoque com motivo e usuário responsável
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1) Permite "baixa" como tipo válido em estoque (além de entrada/saida)
ALTER TABLE estoque DROP CONSTRAINT IF EXISTS estoque_tipo_check;
ALTER TABLE estoque ADD CONSTRAINT estoque_tipo_check
  CHECK (tipo IN ('entrada', 'saida', 'baixa'));

-- 2) Colunas novas: motivo da baixa + email do usuário responsável
ALTER TABLE estoque
  ADD COLUMN IF NOT EXISTS motivo         text,
  ADD COLUMN IF NOT EXISTS usuario_email  text;

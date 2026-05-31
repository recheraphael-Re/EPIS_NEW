-- ============================================================
-- Migração 03: Devolução de EPIs (RF04)
-- Já aplicada no Supabase via MCP. Mantida aqui para histórico.
-- ============================================================

CREATE TABLE IF NOT EXISTS devolucoes (
  id             uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  funcionario_id uuid NOT NULL REFERENCES funcionarios(id),
  epi_id         uuid NOT NULL REFERENCES epi(id),
  quantidade     integer NOT NULL CHECK (quantidade > 0),
  data           date NOT NULL DEFAULT CURRENT_DATE,
  -- reutilizavel = volta ao estoque (entrada); descarte = não retorna ao estoque
  condicao       text NOT NULL CHECK (condicao IN ('reutilizavel', 'descarte')),
  observacao     text,
  usuario_email  text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devolucoes_funcionario ON devolucoes (funcionario_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_epi         ON devolucoes (epi_id);

ALTER TABLE devolucoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY devolucoes_select ON devolucoes FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY devolucoes_insert ON devolucoes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY devolucoes_update ON devolucoes FOR UPDATE
  USING (auth.role() = 'authenticated');
CREATE POLICY devolucoes_delete ON devolucoes FOR DELETE
  USING (auth.role() = 'authenticated');

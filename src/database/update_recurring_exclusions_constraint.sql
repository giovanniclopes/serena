-- =============================================================================
-- Atualizar constraint UNIQUE da tabela task_recurring_exclusions
-- =============================================================================
-- Remove a constraint antiga que não inclui workspace_id
ALTER TABLE
  public.task_recurring_exclusions DROP CONSTRAINT IF EXISTS task_recurring_exclusion_unique;

-- Adiciona a nova constraint com workspace_id incluído
ALTER TABLE
  public.task_recurring_exclusions
ADD
  CONSTRAINT task_recurring_exclusion_unique UNIQUE (user_id, task_id, workspace_id, excluded_date);
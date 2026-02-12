-- =============================================================================
-- Tabela para armazenar exclusões de instâncias recorrentes
-- =============================================================================
-- Tabela para registrar instâncias recorrentes que foram deletadas
CREATE TABLE IF NOT EXISTS public.task_recurring_exclusions (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  excluded_date date NOT NULL,
  -- Data da instância excluída (YYYY-MM-DD)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Garante que uma instância só pode ser excluída uma vez
  CONSTRAINT task_recurring_exclusion_unique UNIQUE (user_id, task_id, excluded_date)
);

COMMENT ON TABLE public.task_recurring_exclusions IS 'Armazena instâncias de tarefas recorrentes que foram deletadas individualmente';

COMMENT ON COLUMN public.task_recurring_exclusions.task_id IS 'ID da tarefa recorrente principal';

COMMENT ON COLUMN public.task_recurring_exclusions.excluded_date IS 'Data da instância excluída (formato: YYYY-MM-DD)';

-- Criar índice para melhorar performance nas consultas
CREATE INDEX idx_task_recurring_exclusions_task_id ON public.task_recurring_exclusions(task_id);

CREATE INDEX idx_task_recurring_exclusions_user_id ON public.task_recurring_exclusions(user_id);

CREATE INDEX idx_task_recurring_exclusions_excluded_date ON public.task_recurring_exclusions(excluded_date);

-- Habilitar RLS para a tabela
ALTER TABLE
  public.task_recurring_exclusions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Utilizadores podem gerir suas exclusões recorrentes" ON public.task_recurring_exclusions FOR ALL USING (
  (
    select
      auth.uid()
  ) = user_id
) WITH CHECK (
  (
    select
      auth.uid()
  ) = user_id
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_handle_updated_at_task_recurring_exclusions BEFORE
UPDATE
  ON public.task_recurring_exclusions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
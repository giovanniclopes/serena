-- =============================================================================
-- Adicionar campo 'order' para ordenação de tarefas e subtarefas
-- =============================================================================
-- Adicionar campo 'order' na tabela tasks
ALTER TABLE
  public.tasks
ADD
  COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;

-- Adicionar campo 'order' na tabela subtasks
ALTER TABLE
  public.subtasks
ADD
  COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;

-- Criar índices para melhorar performance das consultas ordenadas
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks("order");

CREATE INDEX IF NOT EXISTS idx_subtasks_order ON public.subtasks("order");

-- Atualizar registros existentes com valores de ordem baseados na data de criação
-- Para tasks
UPDATE
  public.tasks
SET
  "order" = subquery.row_number
FROM
  (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY workspace_id
        ORDER BY
          created_at
      ) as row_number
    FROM
      public.tasks
  ) AS subquery
WHERE
  public.tasks.id = subquery.id;

-- Para subtasks
UPDATE
  public.subtasks
SET
  "order" = subquery.row_number
FROM
  (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY task_id
        ORDER BY
          created_at
      ) as row_number
    FROM
      public.subtasks
  ) AS subquery
WHERE
  public.subtasks.id = subquery.id;

-- Comentários para documentação
COMMENT ON COLUMN public.tasks."order" IS 'Campo para ordenação das tarefas dentro de um workspace';

COMMENT ON COLUMN public.subtasks."order" IS 'Campo para ordenação das subtarefas dentro de uma tarefa';
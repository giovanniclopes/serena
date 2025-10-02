-- =============================================================================
-- Atualização de Schema: Adicionar Contadores de Tarefas aos Projetos
-- Execute este arquivo no SQL Editor do Supabase
-- =============================================================================
-- =============================================================================
-- 1. ADICIONAR COLUNAS DE CONTADORES À TABELA PROJECTS
-- =============================================================================
ALTER TABLE
  public.projects
ADD
  COLUMN IF NOT EXISTS tasks_total_count integer NOT NULL DEFAULT 0,
ADD
  COLUMN IF NOT EXISTS tasks_completed_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.projects.tasks_total_count IS 'Número total de tarefas associadas ao projeto';

COMMENT ON COLUMN public.projects.tasks_completed_count IS 'Número de tarefas concluídas do projeto';

-- =============================================================================
-- 2. CRIAR FUNÇÃO PARA ATUALIZAR OS CONTADORES
-- =============================================================================
CREATE
OR REPLACE FUNCTION update_project_tasks_count() RETURNS TRIGGER AS $ $ DECLARE affected_project_id uuid;

BEGIN IF TG_OP = 'DELETE' THEN affected_project_id := OLD.project_id;

ELSE affected_project_id := NEW.project_id;

END IF;

IF affected_project_id IS NOT NULL THEN
UPDATE
  public.projects
SET
  tasks_total_count = (
    SELECT
      COUNT(*)
    FROM
      public.tasks
    WHERE
      project_id = affected_project_id
  ),
  tasks_completed_count = (
    SELECT
      COUNT(*)
    FROM
      public.tasks
    WHERE
      project_id = affected_project_id
      AND is_completed = true
  )
WHERE
  id = affected_project_id;

END IF;

IF TG_OP = 'UPDATE'
AND OLD.project_id IS DISTINCT
FROM
  NEW.project_id THEN IF OLD.project_id IS NOT NULL THEN
UPDATE
  public.projects
SET
  tasks_total_count = (
    SELECT
      COUNT(*)
    FROM
      public.tasks
    WHERE
      project_id = OLD.project_id
  ),
  tasks_completed_count = (
    SELECT
      COUNT(*)
    FROM
      public.tasks
    WHERE
      project_id = OLD.project_id
      AND is_completed = true
  )
WHERE
  id = OLD.project_id;

END IF;

END IF;

RETURN COALESCE(NEW, OLD);

END;

$ $ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_project_tasks_count() IS 'Atualiza automaticamente os contadores de tarefas quando uma tarefa é inserida, atualizada ou deletada';

-- =============================================================================
-- 3. CRIAR TRIGGERS PARA MANTER OS CONTADORES ATUALIZADOS
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_project_tasks_count_insert ON public.tasks;

CREATE TRIGGER trigger_update_project_tasks_count_insert
AFTER
INSERT
  ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_project_tasks_count();

DROP TRIGGER IF EXISTS trigger_update_project_tasks_count_update ON public.tasks;

CREATE TRIGGER trigger_update_project_tasks_count_update
AFTER
UPDATE
  ON public.tasks FOR EACH ROW
  WHEN (
    OLD.project_id IS DISTINCT
    FROM
      NEW.project_id
      OR OLD.is_completed IS DISTINCT
    FROM
      NEW.is_completed
  ) EXECUTE FUNCTION update_project_tasks_count();

DROP TRIGGER IF EXISTS trigger_update_project_tasks_count_delete ON public.tasks;

CREATE TRIGGER trigger_update_project_tasks_count_delete
AFTER
  DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_project_tasks_count();

-- =============================================================================
-- 4. POPULAR OS CONTADORES COM DADOS EXISTENTES
-- =============================================================================
UPDATE
  public.projects p
SET
  tasks_total_count = (
    SELECT
      COUNT(*)
    FROM
      public.tasks t
    WHERE
      t.project_id = p.id
  ),
  tasks_completed_count = (
    SELECT
      COUNT(*)
    FROM
      public.tasks t
    WHERE
      t.project_id = p.id
      AND t.is_completed = true
  );

-- =============================================================================
-- 5. VERIFICAÇÃO DOS RESULTADOS
-- =============================================================================
SELECT
  p.id,
  p.name,
  p.tasks_total_count,
  p.tasks_completed_count,
  CASE
    WHEN p.tasks_total_count > 0 THEN ROUND(
      (
        p.tasks_completed_count :: numeric / p.tasks_total_count :: numeric
      ) * 100,
      2
    )
    ELSE 0
  END as completion_percentage
FROM
  public.projects p
ORDER BY
  p.name;
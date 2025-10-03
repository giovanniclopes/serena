-- =============================================================================
-- MIGRAÇÃO: Adicionar campos de recorrência e anexos às tarefas
-- =============================================================================
-- Data: $(date)
-- Descrição: Adiciona suporte a tarefas recorrentes e anexos
-- =============================================================================
-- 1. ADICIONAR CAMPO DE RECORRÊNCIA À TABELA TASKS
-- =============================================================================
ALTER TABLE
  public.tasks
ADD
  COLUMN IF NOT EXISTS recurrence jsonb;

-- Comentário para o campo
COMMENT ON COLUMN public.tasks.recurrence IS 'Configuração de recorrência da tarefa (tipo, intervalo, dias da semana, etc.)';

-- =============================================================================
-- 2. ATUALIZAR CAMPO DE ANEXOS (se não existir)
-- =============================================================================
-- O campo attachments já existe no schema original, mas vamos garantir que está correto
ALTER TABLE
  public.tasks
ADD
  COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]';

-- Comentário para o campo
COMMENT ON COLUMN public.tasks.attachments IS 'Lista de anexos da tarefa (arquivos, imagens, etc.)';

-- =============================================================================
-- 3. ADICIONAR CAMPOS À TABELA SUBTASKS
-- =============================================================================
-- Adicionar os mesmos campos às subtarefas para consistência
ALTER TABLE
  public.subtasks
ADD
  COLUMN IF NOT EXISTS recurrence jsonb,
ADD
  COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]';

-- Comentários para os campos
COMMENT ON COLUMN public.subtasks.recurrence IS 'Configuração de recorrência da subtarefa';

COMMENT ON COLUMN public.subtasks.attachments IS 'Lista de anexos da subtarefa';

-- =============================================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================================================
-- Índice para consultas por recorrência
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence ON public.tasks USING GIN (recurrence);

-- Índice para consultas por anexos
CREATE INDEX IF NOT EXISTS idx_tasks_attachments ON public.tasks USING GIN (attachments);

-- Índices similares para subtarefas
CREATE INDEX IF NOT EXISTS idx_subtasks_recurrence ON public.subtasks USING GIN (recurrence);

CREATE INDEX IF NOT EXISTS idx_subtasks_attachments ON public.subtasks USING GIN (attachments);

-- =============================================================================
-- 5. ATUALIZAR POLÍTICAS RLS (se necessário)
-- =============================================================================
-- As políticas RLS existentes já cobrem os novos campos automaticamente
-- pois eles fazem parte da mesma tabela
-- =============================================================================
-- 6. VALIDAÇÃO DOS DADOS
-- =============================================================================
-- Verificar se as colunas foram criadas corretamente
DO $ $ BEGIN -- Verificar se a coluna recurrence existe na tabela tasks
IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'tasks'
    AND column_name = 'recurrence'
) THEN RAISE EXCEPTION 'Coluna recurrence não foi criada na tabela tasks';

END IF;

-- Verificar se a coluna attachments existe na tabela tasks
IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'tasks'
    AND column_name = 'attachments'
) THEN RAISE EXCEPTION 'Coluna attachments não foi criada na tabela tasks';

END IF;

-- Verificar se as colunas foram criadas na tabela subtasks
IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'subtasks'
    AND column_name = 'recurrence'
) THEN RAISE EXCEPTION 'Coluna recurrence não foi criada na tabela subtasks';

END IF;

IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'subtasks'
    AND column_name = 'attachments'
) THEN RAISE EXCEPTION 'Coluna attachments não foi criada na tabela subtasks';

END IF;

RAISE NOTICE '✅ Migração concluída com sucesso!';

RAISE NOTICE '📋 Campos adicionados:';

RAISE NOTICE '   - tasks.recurrence (jsonb)';

RAISE NOTICE '   - tasks.attachments (jsonb)';

RAISE NOTICE '   - subtasks.recurrence (jsonb)';

RAISE NOTICE '   - subtasks.attachments (jsonb)';

RAISE NOTICE '🔍 Índices criados para otimização de consultas';

END $ $;
-- =============================================================================
-- Comandos ALTER para atualizar o schema existente do Serena
-- Execute este arquivo no SQL Editor do Supabase para atualizar o schema
-- =============================================================================
-- Habilita a extensão para gerar UUIDs, caso ainda não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ATUALIZAÇÕES DA TABELA WORKSPACES
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela workspaces
ALTER TABLE
  public.workspaces
ADD
  COLUMN IF NOT EXISTS description text,
ADD
  COLUMN IF NOT EXISTS color text,
ADD
  COLUMN IF NOT EXISTS icon text,
ADD
  COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- =============================================================================
-- 2. ATUALIZAÇÕES DA TABELA PROJECTS
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela projects
ALTER TABLE
  public.projects
ADD
  COLUMN IF NOT EXISTS description text,
ADD
  COLUMN IF NOT EXISTS icon text,
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- =============================================================================
-- 3. ATUALIZAÇÕES DA TABELA TASKS
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela tasks
ALTER TABLE
  public.tasks
ADD
  COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
ADD
  COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
ADD
  COLUMN IF NOT EXISTS completed_at timestamptz,
ADD
  COLUMN IF NOT EXISTS reminders jsonb DEFAULT '[]',
ADD
  COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]',
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Alterar o tipo da coluna priority para text com CHECK constraint
-- Primeiro, vamos verificar se a coluna existe e qual é o tipo atual
DO $ $ BEGIN -- Se a coluna priority existe e não é do tipo text, vamos alterá-la
IF EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'tasks'
    AND column_name = 'priority'
    AND data_type != 'text'
) THEN -- Primeiro, vamos atualizar os valores existentes para o formato correto
UPDATE
  public.tasks
SET
  priority = 'P' || priority :: text
WHERE
  priority IS NOT NULL;

-- Agora alterar o tipo da coluna priority
ALTER TABLE
  public.tasks
ALTER COLUMN
  priority TYPE text;

-- Adicionar a constraint CHECK
ALTER TABLE
  public.tasks
ADD
  CONSTRAINT tasks_priority_check CHECK (priority IN ('P1', 'P2', 'P3', 'P4'));

END IF;

END $ $;

-- =============================================================================
-- 4. ATUALIZAÇÕES DA TABELA SUBTASKS
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela subtasks
ALTER TABLE
  public.subtasks
ADD
  COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
ADD
  COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
ADD
  COLUMN IF NOT EXISTS description text,
ADD
  COLUMN IF NOT EXISTS due_date timestamptz,
ADD
  COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'P3',
ADD
  COLUMN IF NOT EXISTS completed_at timestamptz,
ADD
  COLUMN IF NOT EXISTS reminders jsonb DEFAULT '[]',
ADD
  COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]',
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Adicionar constraint CHECK para priority em subtasks
ALTER TABLE
  public.subtasks
ADD
  CONSTRAINT subtasks_priority_check CHECK (priority IN ('P1', 'P2', 'P3', 'P4'));

-- =============================================================================
-- 5. ATUALIZAÇÕES DA TABELA HABITS
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela habits
ALTER TABLE
  public.habits
ADD
  COLUMN IF NOT EXISTS description text,
ADD
  COLUMN IF NOT EXISTS target integer NOT NULL DEFAULT 1,
ADD
  COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'vez',
ADD
  COLUMN IF NOT EXISTS icon text,
ADD
  COLUMN IF NOT EXISTS reminders jsonb DEFAULT '[]',
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- =============================================================================
-- 6. ATUALIZAÇÕES DA TABELA HABIT_ENTRIES
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela habit_entries
ALTER TABLE
  public.habit_entries
ADD
  COLUMN IF NOT EXISTS value integer NOT NULL DEFAULT 1,
ADD
  COLUMN IF NOT EXISTS notes text;

-- =============================================================================
-- 7. ATUALIZAÇÕES DA TABELA COUNTDOWNS
-- =============================================================================
-- Adicionar campos que podem estar faltando na tabela countdowns
ALTER TABLE
  public.countdowns
ADD
  COLUMN IF NOT EXISTS description text,
ADD
  COLUMN IF NOT EXISTS color text,
ADD
  COLUMN IF NOT EXISTS icon text,
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- =============================================================================
-- 8. CRIAÇÃO DA TABELA TAGS (se não existir)
-- =============================================================================
-- Criar a tabela tags se ela não existir
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Adicionar comentário na tabela tags
COMMENT ON TABLE public.tags IS 'Tags personalizadas para categorizar tarefas.';

-- =============================================================================
-- 9. ATUALIZAÇÕES DAS POLÍTICAS RLS
-- =============================================================================
-- Habilitar RLS na tabela tags se ainda não estiver habilitado
ALTER TABLE
  public.tags ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para tags (se não existir)
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    pg_policies
  WHERE
    tablename = 'tags'
    AND policyname = 'Utilizadores podem gerir as suas próprias tags.'
) THEN CREATE POLICY "Utilizadores podem gerir as suas próprias tags." ON public.tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

END IF;

END $ $;

-- =============================================================================
-- 10. CRIAÇÃO DE ÍNDICES ADICIONAIS
-- =============================================================================
-- Criar índices para a tabela tags se não existirem
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

CREATE INDEX IF NOT EXISTS idx_tags_workspace_id ON public.tags(workspace_id);

-- Criar índices adicionais que podem estar faltando
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON public.tasks(workspace_id);

CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);

CREATE INDEX IF NOT EXISTS idx_subtasks_workspace_id ON public.subtasks(workspace_id);

CREATE INDEX IF NOT EXISTS idx_subtasks_parent_task_id ON public.subtasks(parent_task_id);

CREATE INDEX IF NOT EXISTS idx_habits_workspace_id ON public.habits(workspace_id);

CREATE INDEX IF NOT EXISTS idx_countdowns_workspace_id ON public.countdowns(workspace_id);

-- =============================================================================
-- 11. ATUALIZAÇÕES DE CONSTRAINTS E VALIDAÇÕES
-- =============================================================================
-- Adicionar constraint UNIQUE para habit_entries se não existir
DO $ $ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.table_constraints
  WHERE
    table_name = 'habit_entries'
    AND constraint_name = 'habit_once_per_day'
) THEN
ALTER TABLE
  public.habit_entries
ADD
  CONSTRAINT habit_once_per_day UNIQUE (user_id, habit_id, completion_date);

END IF;

END $ $;

-- =============================================================================
-- 12. VERIFICAÇÃO FINAL
-- =============================================================================
-- Verificar se todas as tabelas foram criadas/atualizadas corretamente
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name IN (
    'workspaces',
    'projects',
    'tasks',
    'subtasks',
    'habits',
    'habit_entries',
    'countdowns',
    'tags'
  )
ORDER BY
  table_name,
  ordinal_position;

-- Verificar se as políticas RLS estão ativas
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM
  pg_tables
WHERE
  schemaname = 'public'
  AND tablename IN (
    'workspaces',
    'projects',
    'tasks',
    'subtasks',
    'habits',
    'habit_entries',
    'countdowns',
    'tags'
  )
ORDER BY
  tablename;

-- Verificar se os índices foram criados
SELECT
  indexname,
  tablename,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
  AND tablename IN (
    'workspaces',
    'projects',
    'tasks',
    'subtasks',
    'habits',
    'habit_entries',
    'countdowns',
    'tags'
  )
ORDER BY
  tablename,
  indexname;
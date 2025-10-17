-- =============================================================================
-- Schema SQL para o Aplicativo Serena
-- Plataforma: PostgreSQL (Otimizado para Supabase)
-- =============================================================================
-- Habilita a extensão para gerar UUIDs, caso ainda não esteja habilitada.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CRIAÇÃO DAS TABELAS
-- =============================================================================
-- Tabela para armazenar informações de perfil que estendem a tabela auth.users.
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  birth_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Armazena dados públicos do perfil do utilizador.';

-- Tabela para separar contextos como "Pessoal" e "Trabalho".
CREATE TABLE public.workspaces (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text,
  icon text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.workspaces IS 'Permite a separação de contextos (Pessoal, Trabalho, etc.).';

-- Tabela para agrupar tarefas relacionadas a um objetivo.
CREATE TABLE public.projects (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text,
  icon text,
  tasks_total_count integer NOT NULL DEFAULT 0,
  tasks_completed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.projects IS 'Agrupa tarefas relacionadas a um objetivo comum.';

COMMENT ON COLUMN public.projects.tasks_total_count IS 'Número total de tarefas associadas ao projeto';

COMMENT ON COLUMN public.projects.tasks_completed_count IS 'Número de tarefas concluídas do projeto';

-- Tabela principal para as tarefas.
CREATE TABLE public.tasks (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE
  SET
    NULL,
    -- Se o projeto for apagado, a tarefa fica sem projeto.
    parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date timestamptz,
    priority text NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    is_completed boolean NOT NULL DEFAULT false,
    completed_at timestamptz,
    reminders jsonb DEFAULT '[]',
    tags jsonb DEFAULT '[]',
    attachments jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tasks IS 'A unidade fundamental de organização do aplicativo.';

-- Tabela para subtarefas dentro de uma tarefa principal.
CREATE TABLE public.subtasks (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  priority text NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  reminders jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subtasks IS 'Passos ou itens menores dentro de uma tarefa principal.';

-- Tabela para definir hábitos a serem rastreados.
CREATE TABLE public.habits (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  target integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'vez',
  color text,
  icon text,
  category text NOT NULL DEFAULT 'outro',
  reminders jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.habits IS 'Define um hábito que o utilizador deseja rastrear.';

-- Tabela para registar cada conclusão de um hábito.
CREATE TABLE public.habit_entries (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  value integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Garante que um hábito só pode ser concluído uma vez por dia por utilizador.
  CONSTRAINT habit_once_per_day UNIQUE (user_id, habit_id, completion_date)
);

COMMENT ON TABLE public.habit_entries IS 'Regista cada vez que um hábito é marcado como concluído.';

-- Tabela para eventos de contagem regressiva.
CREATE TABLE public.countdowns (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  color text,
  icon text,
  background_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.countdowns IS 'Armazena eventos para contagem regressiva.';

-- Tabela para tags personalizadas.
CREATE TABLE public.tags (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tags IS 'Tags personalizadas para categorizar tarefas.';

-- =============================================================================
-- 2. POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY - RLS)
-- =============================================================================
-- Habilita RLS para cada tabela e define as políticas.
-- O padrão é permitir que o utilizador realize todas as ações (CRUD) apenas nos seus próprios dados.
-- Perfis
ALTER TABLE
  public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem ver e editar o seu próprio perfil." ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Workspaces
ALTER TABLE
  public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios workspaces." ON public.workspaces FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Projetos
ALTER TABLE
  public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios projetos." ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tarefas
ALTER TABLE
  public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias tarefas." ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subtarefas
ALTER TABLE
  public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias subtarefas." ON public.subtasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hábitos
ALTER TABLE
  public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios hábitos." ON public.habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Entradas de Hábitos
ALTER TABLE
  public.habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias entradas de hábitos." ON public.habit_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Contagens Regressivas
ALTER TABLE
  public.countdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias contagens regressivas." ON public.countdowns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tags
ALTER TABLE
  public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias tags." ON public.tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- =============================================================================
-- Cria índices em chaves estrangeiras e colunas frequentemente consultadas
-- para acelerar as operações de leitura (SELECTs com WHERE e JOINs).
CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);

CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX idx_subtasks_user_id ON public.subtasks(user_id);

CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);

CREATE INDEX idx_subtasks_due_date ON public.subtasks(due_date);

CREATE INDEX idx_habits_user_id ON public.habits(user_id);

CREATE INDEX idx_habits_workspace_id ON public.habits(workspace_id);

CREATE INDEX idx_habit_entries_user_id ON public.habit_entries(user_id);

CREATE INDEX idx_habit_entries_habit_id ON public.habit_entries(habit_id);

CREATE INDEX idx_countdowns_user_id ON public.countdowns(user_id);

CREATE INDEX idx_countdowns_workspace_id ON public.countdowns(workspace_id);

CREATE INDEX idx_tags_user_id ON public.tags(user_id);

CREATE INDEX idx_tags_workspace_id ON public.tags(workspace_id);

-- =============================================================================
-- 4. FUNÇÕES E TRIGGERS PARA MANTER CONTADORES ATUALIZADOS
-- =============================================================================
-- Função para atualizar automaticamente os contadores de tarefas dos projetos
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

-- Triggers para manter os contadores atualizados
CREATE TRIGGER trigger_update_project_tasks_count_insert
AFTER
INSERT
  ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_project_tasks_count();

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

CREATE TRIGGER trigger_update_project_tasks_count_delete
AFTER
  DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_project_tasks_count();
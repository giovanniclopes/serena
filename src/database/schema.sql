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

-- Tabela para armazenar listas de compras
CREATE TABLE public.shopping_lists (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'geral',
  color text NOT NULL DEFAULT '#ec4899',
  icon text,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shopping_lists IS 'Listas de compras organizadas por categoria e workspace.';

-- Tabela para itens das listas de compras
CREATE TABLE public.shopping_list_items (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_list_id uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity text DEFAULT '1',
  notes text,
  price DECIMAL(10,2) DEFAULT NULL,
  is_purchased boolean NOT NULL DEFAULT false,
  purchased_at timestamptz,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shopping_list_items IS 'Itens individuais dentro de uma lista de compras.';

-- Tabela para compartilhamento de tarefas entre utilizadores.
CREATE TABLE public.task_shares (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, shared_with_user_id)
);

COMMENT ON TABLE public.task_shares IS 'Armazena compartilhamentos de tarefas entre utilizadores.';

COMMENT ON COLUMN public.task_shares.task_id IS 'ID da tarefa compartilhada';
COMMENT ON COLUMN public.task_shares.shared_with_user_id IS 'ID do utilizador com quem a tarefa foi compartilhada';
COMMENT ON COLUMN public.task_shares.role IS 'Papel do utilizador: viewer (visualizar) ou editor (editar)';

-- =============================================================================
-- 2. POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY - RLS)
-- =============================================================================
-- Habilita RLS para cada tabela e define as políticas.
-- O padrão é permitir que o utilizador realize todas as ações (CRUD) apenas nos seus próprios dados.
-- Perfis
ALTER TABLE
  public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem ver e editar o seu próprio perfil." ON public.profiles FOR ALL USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- Workspaces
ALTER TABLE
  public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios workspaces." ON public.workspaces FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Projetos
ALTER TABLE
  public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios projetos." ON public.projects FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Tarefas
ALTER TABLE
  public.tasks ENABLE ROW LEVEL SECURITY;

-- Funções para verificar propriedade e compartilhamento de tarefas (usadas nas políticas RLS)
-- Devem ser criadas ANTES das políticas para evitar recursão
-- SECURITY DEFINER permite que essas funções executem com privilégios elevados, bypassando RLS

-- Função para verificar se tarefa está compartilhada com o usuário
CREATE OR REPLACE FUNCTION public.is_task_shared_with_user(task_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.task_shares 
    WHERE task_id = task_id_param 
    AND shared_with_user_id = auth.uid()
  );
END;
$$;

-- Função para verificar se usuário tem role editor na tarefa compartilhada
CREATE OR REPLACE FUNCTION public.is_task_shared_as_editor(task_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.task_shares 
    WHERE task_id = task_id_param
    AND shared_with_user_id = auth.uid()
    AND role = 'editor'
  );
END;
$$;

DROP POLICY IF EXISTS "Utilizadores podem gerir as suas próprias tarefas." ON public.tasks;
DROP POLICY IF EXISTS "Utilizadores podem ver suas próprias tarefas e compartilhadas" ON public.tasks;
DROP POLICY IF EXISTS "Utilizadores podem editar suas próprias tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Utilizadores podem editar tarefas compartilhadas como editor" ON public.tasks;
DROP POLICY IF EXISTS "Utilizadores podem deletar suas próprias tarefas" ON public.tasks;

CREATE POLICY "Utilizadores podem ver suas próprias tarefas e compartilhadas" 
ON public.tasks 
FOR SELECT 
USING (
  (select auth.uid()) = user_id 
  OR public.is_task_shared_with_user(tasks.id)
);

CREATE POLICY "Utilizadores podem inserir suas próprias tarefas" 
ON public.tasks 
FOR INSERT 
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Utilizadores podem editar suas próprias tarefas" 
ON public.tasks 
FOR UPDATE 
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Utilizadores podem editar tarefas compartilhadas como editor" 
ON public.tasks 
FOR UPDATE 
USING (public.is_task_shared_as_editor(tasks.id))
WITH CHECK (public.is_task_shared_as_editor(tasks.id));

CREATE POLICY "Utilizadores podem deletar suas próprias tarefas" 
ON public.tasks 
FOR DELETE 
USING ((select auth.uid()) = user_id);

-- Subtarefas
ALTER TABLE
  public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias subtarefas." ON public.subtasks FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Hábitos
ALTER TABLE
  public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios hábitos." ON public.habits FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Entradas de Hábitos
ALTER TABLE
  public.habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias entradas de hábitos." ON public.habit_entries FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Contagens Regressivas
ALTER TABLE
  public.countdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias contagens regressivas." ON public.countdowns FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Tags
ALTER TABLE
  public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias tags." ON public.tags FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Listas de Compras
ALTER TABLE
  public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir as suas próprias listas de compras." ON public.shopping_lists FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Itens das Listas de Compras
ALTER TABLE
  public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem gerir os seus próprios itens de lista de compras." ON public.shopping_list_items FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Compartilhamentos de Tarefas
ALTER TABLE
  public.task_shares ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é dono da tarefa (usada nas políticas RLS de task_shares)
-- SECURITY DEFINER permite que essa função execute com privilégios elevados, bypassando RLS
CREATE OR REPLACE FUNCTION public.is_task_owner(task_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.tasks 
    WHERE id = task_id_param 
    AND user_id = auth.uid()
  );
END;
$$;

CREATE POLICY "Dono da tarefa pode compartilhar" ON public.task_shares FOR INSERT WITH CHECK (public.is_task_owner(task_id));

CREATE POLICY "Dono e compartilhado podem ver compartilhamentos" ON public.task_shares FOR SELECT USING (public.is_task_owner(task_id) OR shared_with_user_id = (select auth.uid()));

CREATE POLICY "Dono da tarefa pode atualizar compartilhamentos" ON public.task_shares FOR UPDATE USING (public.is_task_owner(task_id)) WITH CHECK (public.is_task_owner(task_id));

CREATE POLICY "Dono ou compartilhado podem remover compartilhamento" ON public.task_shares FOR DELETE USING (public.is_task_owner(task_id) OR shared_with_user_id = (select auth.uid()));

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

CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists(user_id);

CREATE INDEX idx_shopping_lists_workspace_id ON public.shopping_lists(workspace_id);

CREATE INDEX idx_shopping_lists_category ON public.shopping_lists(category);

CREATE INDEX idx_shopping_lists_is_completed ON public.shopping_lists(is_completed);

CREATE INDEX idx_shopping_list_items_user_id ON public.shopping_list_items(user_id);

CREATE INDEX idx_shopping_list_items_shopping_list_id ON public.shopping_list_items(shopping_list_id);

CREATE INDEX idx_shopping_list_items_workspace_id ON public.shopping_list_items(workspace_id);

CREATE INDEX idx_shopping_list_items_is_purchased ON public.shopping_list_items(is_purchased);

CREATE INDEX idx_shopping_list_items_order_index ON public.shopping_list_items(order_index);

CREATE INDEX idx_task_shares_task_id ON public.task_shares(task_id);

CREATE INDEX idx_task_shares_shared_with_user_id ON public.task_shares(shared_with_user_id);

-- =============================================================================
-- 4. FUNÇÕES E TRIGGERS PARA MANTER CONTADORES ATUALIZADOS
-- =============================================================================
-- Função para atualizar automaticamente os contadores de tarefas dos projetos
CREATE OR REPLACE FUNCTION update_project_tasks_count() 
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE 
  affected_project_id uuid;
BEGIN 
  IF TG_OP = 'DELETE' THEN 
    affected_project_id := OLD.project_id;
  ELSE 
    affected_project_id := NEW.project_id;
  END IF;

  IF affected_project_id IS NOT NULL THEN
    UPDATE public.projects
    SET
      tasks_total_count = (
        SELECT COUNT(*)
        FROM public.tasks
        WHERE project_id = affected_project_id
      ),
      tasks_completed_count = (
        SELECT COUNT(*)
        FROM public.tasks
        WHERE project_id = affected_project_id
        AND is_completed = true
      )
    WHERE id = affected_project_id;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN 
    IF OLD.project_id IS NOT NULL THEN
      UPDATE public.projects
      SET
        tasks_total_count = (
          SELECT COUNT(*)
          FROM public.tasks
          WHERE project_id = OLD.project_id
        ),
        tasks_completed_count = (
          SELECT COUNT(*)
          FROM public.tasks
          WHERE project_id = OLD.project_id
          AND is_completed = true
        )
      WHERE id = OLD.project_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

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

-- Função para atualizar automaticamente o status de conclusão da lista de compras
CREATE OR REPLACE FUNCTION update_shopping_list_completion() 
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  list_id uuid;
  total_items integer;
  purchased_items integer;
BEGIN
  -- Determinar o ID da lista
  IF TG_OP = 'DELETE' THEN
    list_id := OLD.shopping_list_id;
  ELSE
    list_id := NEW.shopping_list_id;
  END IF;

  -- Contar itens totais e comprados
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_purchased = true)
  INTO total_items, purchased_items
  FROM public.shopping_list_items
  WHERE shopping_list_id = list_id;

  -- Atualizar status da lista
  UPDATE public.shopping_lists
  SET 
    is_completed = (total_items > 0 AND purchased_items = total_items),
    completed_at = CASE 
      WHEN (total_items > 0 AND purchased_items = total_items) THEN now()
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = list_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_shopping_list_completion() IS 'Atualiza automaticamente o status de conclusão da lista quando itens são modificados';

-- Triggers para manter o status de conclusão das listas de compras atualizado
CREATE TRIGGER trigger_update_shopping_list_completion_insert
  AFTER INSERT ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_shopping_list_completion();

CREATE TRIGGER trigger_update_shopping_list_completion_update
  AFTER UPDATE ON public.shopping_list_items
  FOR EACH ROW 
  WHEN (OLD.is_purchased IS DISTINCT FROM NEW.is_purchased)
  EXECUTE FUNCTION update_shopping_list_completion();

CREATE TRIGGER trigger_update_shopping_list_completion_delete
  AFTER DELETE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_shopping_list_completion();

-- =============================================================================
-- 5. FUNÇÕES ADICIONAIS DE SEGURANÇA E UTILIDADE
-- =============================================================================

-- Função para atualizar timestamp updated_at automaticamente
CREATE OR REPLACE FUNCTION handle_updated_at() 
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar subtarefas pendentes antes de completar tarefa principal
CREATE OR REPLACE FUNCTION check_pending_subtasks_before_completion() 
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  pending_subtasks_count integer;
BEGIN
  -- Se a tarefa está sendo marcada como concluída
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD IS NULL) THEN
    -- Contar subtarefas pendentes
    SELECT COUNT(*)
    INTO pending_subtasks_count
    FROM public.subtasks
    WHERE task_id = NEW.id AND is_completed = false;
    
    -- Se há subtarefas pendentes, impedir a conclusão
    IF pending_subtasks_count > 0 THEN
      RAISE EXCEPTION 'Não é possível concluir a tarefa. Existem % subtarefas pendentes.', pending_subtasks_count;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estatísticas de compra de itens
CREATE OR REPLACE FUNCTION update_item_purchase_stats() 
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  list_id uuid;
BEGIN
  -- Determinar o ID da lista
  IF TG_OP = 'DELETE' THEN
    list_id := OLD.shopping_list_id;
  ELSE
    list_id := NEW.shopping_list_id;
  END IF;

  -- Atualizar estatísticas da lista (pode ser expandido no futuro)
  UPDATE public.shopping_lists
  SET updated_at = now()
  WHERE id = list_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Função para criar lista de compras recorrente
CREATE OR REPLACE FUNCTION create_recurring_shopping_list() 
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE
  new_list_id uuid;
BEGIN
  -- Esta função pode ser expandida para criar listas recorrentes
  -- Por enquanto, apenas retorna o registro original
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar workspace padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_workspace() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_workspace_id uuid;
BEGIN
  -- Criar workspace padrão para o novo usuário
  INSERT INTO public.workspaces (user_id, name, description, is_default)
  VALUES (NEW.id, 'Pessoal', 'Workspace padrão', true)
  RETURNING id INTO default_workspace_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função alternativa para atualizar contadores de tarefas
CREATE OR REPLACE FUNCTION update_project_task_counts() 
RETURNS TRIGGER 
SET search_path = public
AS $$
DECLARE 
  affected_project_id uuid;
BEGIN 
  IF TG_OP = 'DELETE' THEN 
    affected_project_id := OLD.project_id;
  ELSE 
    affected_project_id := NEW.project_id;
  END IF;

  IF affected_project_id IS NOT NULL THEN
    UPDATE public.projects
    SET
      tasks_total_count = (
        SELECT COUNT(*)
        FROM public.tasks
        WHERE project_id = affected_project_id
      ),
      tasks_completed_count = (
        SELECT COUNT(*)
        FROM public.tasks
        WHERE project_id = affected_project_id
        AND is_completed = true
      )
    WHERE id = affected_project_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. TRIGGERS ADICIONAIS PARA FUNCIONALIDADES DE SEGURANÇA
-- =============================================================================

-- Triggers para atualizar updated_at automaticamente em todas as tabelas
CREATE TRIGGER trigger_handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_workspaces
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_subtasks
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_habits
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_countdowns
  BEFORE UPDATE ON public.countdowns
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_tags
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_shopping_lists
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_handle_updated_at_shopping_list_items
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger para verificar subtarefas pendentes antes de completar tarefa
CREATE TRIGGER trigger_check_pending_subtasks_before_completion
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW 
  WHEN (OLD.is_completed IS DISTINCT FROM NEW.is_completed)
  EXECUTE FUNCTION check_pending_subtasks_before_completion();

-- Trigger para atualizar estatísticas de compra
CREATE TRIGGER trigger_update_item_purchase_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_item_purchase_stats();

-- Trigger para criar workspace padrão para novos usuários
CREATE TRIGGER trigger_create_default_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_workspace();

-- =============================================================================
-- 7. COMENTÁRIOS DAS FUNÇÕES ADICIONAIS
-- =============================================================================

COMMENT ON FUNCTION handle_updated_at() IS 'Atualiza automaticamente o campo updated_at em todas as tabelas';
COMMENT ON FUNCTION check_pending_subtasks_before_completion() IS 'Verifica se há subtarefas pendentes antes de permitir conclusão da tarefa principal';
COMMENT ON FUNCTION update_item_purchase_stats() IS 'Atualiza estatísticas de compra de itens das listas';
COMMENT ON FUNCTION create_recurring_shopping_list() IS 'Cria listas de compras recorrentes (funcionalidade futura)';
COMMENT ON FUNCTION create_default_workspace() IS 'Cria workspace padrão para novos usuários';
COMMENT ON FUNCTION update_project_task_counts() IS 'Versão alternativa para atualizar contadores de tarefas dos projetos';
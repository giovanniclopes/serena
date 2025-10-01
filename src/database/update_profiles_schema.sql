-- =============================================================================
-- Atualização do Schema - Tabela Profiles
-- Adiciona novos campos para perfil completo do usuário
-- =============================================================================
-- Adiciona novos campos à tabela profiles existente
ALTER TABLE
  public.profiles
ADD
  COLUMN IF NOT EXISTS first_name text,
ADD
  COLUMN IF NOT EXISTS last_name text,
ADD
  COLUMN IF NOT EXISTS birth_date date,
ADD
  COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
ADD
  COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
ADD
  COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Atualiza o comentário da tabela
COMMENT ON TABLE public.profiles IS 'Armazena dados públicos do perfil do utilizador.';

-- Cria trigger para atualizar updated_at automaticamente
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $ func $ BEGIN NEW.updated_at = now();

RETURN NEW;

END;

$ func $ language plpgsql;

-- Aplica o trigger na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE
  ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
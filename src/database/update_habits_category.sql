-- Adicionar coluna category na tabela habits
ALTER TABLE
  public.habits
ADD
  COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'outro';

-- Comentário para a nova coluna
COMMENT ON COLUMN public.habits.category IS 'Categoria do hábito para organização (saude, fitness, mental, etc.)';
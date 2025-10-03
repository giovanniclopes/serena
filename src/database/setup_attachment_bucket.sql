-- =============================================================================
-- CONFIGURAÇÃO: Bucket de Anexos no Supabase Storage
-- =============================================================================
-- Descrição: Configura o bucket "attachment" para armazenar anexos de tarefas
-- =============================================================================
-- =============================================================================
-- 1. CRIAR BUCKET DE ANEXOS
-- =============================================================================
INSERT INTO
  storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
  )
VALUES
  (
    'attachment',
    'attachment',
    true,
    10485760,
    -- 10MB em bytes
    ARRAY [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  ) ON CONFLICT (id) DO
UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 2. CONFIGURAR POLÍTICAS RLS PARA O BUCKET
-- =============================================================================
-- Política para permitir leitura pública de arquivos
CREATE POLICY "Permitir leitura pública de anexos" ON storage.objects FOR
SELECT
  USING (bucket_id = 'attachment');

-- Política para permitir upload de arquivos (apenas usuários autenticados)
CREATE POLICY "Permitir upload de anexos" ON storage.objects FOR
INSERT
  WITH CHECK (
    bucket_id = 'attachment'
    AND auth.role() = 'authenticated'
  );

-- Política para permitir atualização de arquivos (apenas o proprietário)
CREATE POLICY "Permitir atualização de anexos" ON storage.objects FOR
UPDATE
  USING (
    bucket_id = 'attachment'
    AND auth.uid() :: text = (storage.foldername(name)) [1]
  );

-- Política para permitir exclusão de arquivos (apenas o proprietário)
CREATE POLICY "Permitir exclusão de anexos" ON storage.objects FOR DELETE USING (
  bucket_id = 'attachment'
  AND auth.uid() :: text = (storage.foldername(name)) [1]
);

-- =============================================================================
-- 3. CONFIGURAR CORS PARA O BUCKET (se necessário)
-- =============================================================================
-- Nota: CORS é configurado no painel do Supabase, não via SQL
-- =============================================================================
-- 4. VALIDAÇÃO DA CONFIGURAÇÃO
-- =============================================================================
DO $ $ BEGIN -- Verificar se o bucket foi criado
IF NOT EXISTS (
  SELECT
    1
  FROM
    storage.buckets
  WHERE
    id = 'attachment'
) THEN RAISE EXCEPTION 'Bucket "attachment" não foi criado';

END IF;

-- Verificar se as políticas foram criadas
IF NOT EXISTS (
  SELECT
    1
  FROM
    pg_policies
  WHERE
    tablename = 'objects'
    AND policyname = 'Permitir leitura pública de anexos'
) THEN RAISE EXCEPTION 'Política de leitura não foi criada';

END IF;

IF NOT EXISTS (
  SELECT
    1
  FROM
    pg_policies
  WHERE
    tablename = 'objects'
    AND policyname = 'Permitir upload de anexos'
) THEN RAISE EXCEPTION 'Política de upload não foi criada';

END IF;

RAISE NOTICE '✅ Bucket "attachment" configurado com sucesso!';

RAISE NOTICE '📁 Bucket: attachment';

RAISE NOTICE '🔒 Público: true';

RAISE NOTICE '📏 Limite de tamanho: 10MB';

RAISE NOTICE '📋 Tipos permitidos: Imagens, PDFs, documentos';

RAISE NOTICE '🔐 Políticas RLS configuradas';

END $ $;
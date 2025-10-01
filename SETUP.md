# Configuração do Supabase

Para usar o Serena com Supabase, você precisa configurar as variáveis de ambiente.

## 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Obter as credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá para Settings > API
4. Copie a URL do projeto e a chave anônima (anon key)

## 3. Executar o schema SQL

Execute o arquivo `src/database/schema.sql` no SQL Editor do Supabase para criar as tabelas necessárias.

## 4. Configurar autenticação

No painel do Supabase:

1. Vá para Authentication > Settings
2. Configure as URLs permitidas para seu domínio
3. Ative o provider de email se necessário

## 5. Executar a aplicação

```bash
pnpm install
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

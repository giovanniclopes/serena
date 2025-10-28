# Variáveis de Ambiente Necessárias

Para usar as funcionalidades de IA do Serena, você precisa configurar as seguintes variáveis de ambiente no arquivo `.env.local`:

## Configurações do Supabase (já existentes)

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Configurações da API Gemini (novas)

```
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
VITE_ENABLE_AI_FEATURES=true
```

## Como obter a chave da API Gemini:

1. Acesse o [Google AI Studio](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Crie uma nova chave de API
5. Copie a chave e cole no arquivo `.env.local`

## Controle de Features:

- `VITE_ENABLE_AI_FEATURES=true`: Habilita todas as funcionalidades de IA
- `VITE_ENABLE_AI_FEATURES=false`: Desabilita as funcionalidades de IA (fallback para modo manual)

## Limites da API Gratuita:

- 60 requisições por minuto
- 1 milhão de tokens por mês
- Rate limiting implementado no código
- Modelo utilizado: `gemini-2.0-flash`

## Solução de Problemas:

Se você receber erro 404 "models/gemini-pro is not found":

- O modelo foi atualizado para `gemini-2.0-flash`
- Certifique-se de que sua chave de API está válida
- Verifique se a API está habilitada no Google Cloud Console

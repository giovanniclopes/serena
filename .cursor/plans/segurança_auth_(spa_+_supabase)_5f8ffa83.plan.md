---
name: Segurança auth (SPA + Supabase)
overview: Endurecer o login local e superfície web da Serena mantendo SPA + Supabase Auth direto no browser e fluxo Bearer token. Implementa melhorias que são possíveis sem backend (mensagens genéricas, rotação/encerramento de sessão, headers de segurança/CSP no deploy, e ajustes anti-enumeração), e documenta claramente o que fica bloqueado por limitações arquiteturais (HttpOnly cookie, rate limit real por IP/conta, lockout robusto).
todos:
  - id: anti-enumeracao
    content: Padronizar mensagens genéricas em login e recuperação de senha (sem vazar se usuário existe)
    status: pending
  - id: sessao-login
    content: Limpar sessão local antes do login e garantir sessão nova no sucesso
    status: pending
  - id: invalidate-sessoes-senha
    content: Após troca de senha, invalidar sessões via signOut global e ajustar UX do reset
    status: pending
  - id: rate-limit-mitigacao
    content: Adicionar cooldown progressivo no UI + orientar rate limits no Supabase Auth
    status: pending
  - id: vercel-security-headers
    content: Adicionar headers de segurança e CSP no vercel.json e validar compatibilidade
    status: pending
  - id: build-e-validacao
    content: Rodar build e checar erros após mudanças
    status: pending
isProject: false
---

## Estado atual (evidências)

- O cliente Supabase é criado no browser sem configuração de cookies/armazenamento em `src/lib/supabaseClient.ts`.

```1:10:/home/giovanni-lopes/Dev/Personal/serena/src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("URL e chave de acesso são obrigatórios.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- O login usa `signInWithPassword` e hoje lança uma mensagem relativamente descritiva para credenciais inválidas em `src/services/auth.ts`.

```31:50:/home/giovanni-lopes/Dev/Personal/serena/src/services/auth.ts
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro ao fazer login:", error);

    if (error.message === "Invalid login credentials") {
      throw new Error(
        "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
      );
    }

    throw new Error(error.message);
  }

  return data;
}
```

- A tela de login exibe o `err.message` diretamente (`src/pages/Login.tsx`), o que torna ainda mais importante padronizar/“generalizar” mensagens do backend de auth.

```37:44:/home/giovanni-lopes/Dev/Personal/serena/src/pages/Login.tsx
    try {
      await signIn(email, password);
      console.log("🎉 Login realizado com sucesso");
      navigate("/");
    } catch (err) {
      console.log("💥 Erro ao fazer login:", err);
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    }
```

## Decisão do usuário incorporada

- Manter **SPA + Supabase Auth no browser**.
- Manter **Bearer token** (logo, token precisa ser acessível ao JS e não pode ser armazenado como HttpOnly cookie).

## Plano de implementação (o que faremos agora)

### 1) Mensagens anti-enumeração (login e recuperação)

- Ajustar `src/services/auth.ts` para sempre retornar mensagem **genérica e consistente** em falha de login (ex.: `"E-mail ou senha incorretos"`), sem variar por causa raiz.
- Ajustar `src/context/AuthContext.tsx` e `src/pages/Login.tsx` para não exibirem mensagens diferentes para o mesmo tipo de falha.
- Ajustar `src/pages/ForgotPassword.tsx` para comportamento anti-enumeração: sempre concluir com mensagem de sucesso genérica do tipo “se existir conta, enviaremos instruções”, mesmo que o e-mail não exista.

### 2) Rotação/limpeza de sessão no login

- Antes de `signInWithPassword`, executar `supabase.auth.signOut({ scope: 'local' })` para limpar sessão local anterior (evita reaproveitamento acidental de sessão antiga no mesmo device).
- Garantir que após login a app esteja usando sessão recém-emitida (o Supabase já cria sessão nova ao autenticar).

### 3) Invalidar todas as sessões ao trocar a senha

- Em `src/services/auth.ts` no fluxo `updatePassword`, após `supabase.auth.updateUser({ password })`, executar `supabase.auth.signOut({ scope: 'global' })`.
- Ajustar a UX do `src/pages/ResetPassword.tsx` para lidar com o sign-out global (redirecionar para `/login` e exigir novo login).

### 4) Rate limiting / lockout (limitação arquitetural + mitigação prática)

- Aplicar mitigação no cliente: cooldown progressivo por e-mail no UI (não é controle de segurança robusto, mas reduz brute force via interface).
- Documentar e orientar configuração do Supabase Auth (Dashboard) para rate limits de sign-in/sign-up no nível do provedor.
- Registrar como “bloqueado sem backend” o requisito de rate limiting **real** por IP/conta e lockout robusto após 10 falhas.

### 5) Headers de segurança e CSP (deploy Vercel)

- Atualizar `vercel.json` para adicionar headers de segurança globais:
  - `Content-Security-Policy` (ajustado para fontes do Google, Supabase, Vercel Analytics e Gemini quando habilitado)
  - `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/`frame-ancestors`.
- Validar que o CSP não quebra o app (especialmente `connect-src` para Supabase, Vercel Analytics e Gemini).

### 6) Backlog explícito (para próxima etapa / requer backend)

- Cookie `HttpOnly`/`Secure`/`SameSite=Strict` para token/sessão.
- CSRF token (necessário apenas se migrar para cookies + requests stateful).
- Verificação de signature/issuer/audience de JWT com garantias fortes (ideal no backend/microserviços; no browser é possível mas não substitui verificação server-side).
- Lockout por IP/conta e telemetria de tentativas (exige BFF/Edge Function).

## Como testar (quando formos executar)

- `pnpm install`
- `pnpm build`
- Testes manuais:
  - Login com credenciais inválidas: sempre mesma mensagem genérica.
  - Recuperação de senha: sempre resposta genérica (não revela existência).
  - Reset de senha: após redefinir, todas as sessões são invalidadas (o device atual será desconectado e exigirá novo login).
  - Verificar headers no deploy/preview (DevTools → Network → Response Headers) e checar se CSP não bloqueia chamadas ao Supabase/Analytics/Gemini.

## Observações importantes (não vamos prometer o impossível)

- Com a decisão “SPA + Bearer token”, **não** é possível cumprir “guardar token em Cookie HttpOnly” nesta etapa.
- Rate limiting/lockout forte por IP/conta também não é garantível sem um componente servidor.

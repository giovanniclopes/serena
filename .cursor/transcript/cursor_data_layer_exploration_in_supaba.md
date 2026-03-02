# Data layer exploration in Supabase and React Query
_Exported on 3/2/2026 at 15:49:19 GMT-3 from Cursor (2.5.26)_

---

**User**

Explore o repo /home/giovanni-lopes/Dev/Personal/serena (somente leitura) focando na camada de dados: Supabase, React Query, serviços, hooks, cache e estado.

Retorne:
- Onde ficam clientes/configs do Supabase e como são usados
- Padrão de hooks (ex.: useQuery/useMutation) e organização (services vs hooks)
- Problemas comuns: duplicação de queries, chaves inconsistentes, manejo de erros repetido, tipos fracos
- O que componentizar/centralizar (ex.: fetch wrappers, error boundaries, toasts)
- Arquivos possivelmente redundantes/obsoletos.

Inclua caminhos de arquivos e símbolos relevantes.

---

**Cursor**

Vou mapear a camada de dados do repo (Supabase, React Query, services/hooks, cache/estado) lendo README e depois varrendo o código por pontos de entrada (client/config), provedores (QueryClient/Supabase), e padrões de `useQuery/useMutation`. Em seguida aponto duplicações/inconsistências e oportunidades de centralização, com caminhos e símbolos.

Achei o ponto central do Supabase (`src/lib/supabaseClient.ts`) e o bootstrap do React Query (`src/main.tsx`). Próximo passo: abrir esses arquivos + alguns hooks representativos para extrair padrões de chaves, invalidações, tratamento de erro e tipagem; depois aponto duplicações e o que vale centralizar.

Já dá pra ver o desenho geral: `services/*` parecem ser a camada “API” (provavelmente chamando Supabase) e `features/*/use*.ts(x)` concentram `useQuery/useMutation` com `toast` + `invalidateQueries`. Agora vou abrir alguns `services` e procurar por: (a) múltiplos “clientes” do Supabase, (b) padrões repetidos de erro/tipagem, (c) inconsistências de `queryKey` (camelCase vs kebab-case) e (d) wrappers/fetch utilitários existentes.

Já identifiquei dois “núcleos” fortes: (1) Supabase centralizado em `src/lib/supabaseClient.ts` e consumido por vários `src/services/*`; (2) React Query inicializado em `src/main.tsx`, com chaves e `toast` espalhados por hooks de `features/*` e alguns componentes. Agora vou caçar inconsistências de `queryKey`, uso de `services/index.ts`, e potenciais duplicações/arquivos não utilizados.

Agora já dá pra apontar um problema concreto de cache: há `queryKey` em **kebab-case** nos hooks (`"shopping-lists"`, `"sticky-notes"`) mas alguns componentes invalidam **camelCase** (`"shoppingLists"`, `"stickyNotes"`), o que pode quebrar invalidação e deixar UI “stale”. Vou checar como o estado global (contexts/offline) interage com o React Query, e se existe algum wrapper de erro/cache já pronto.

## Legenda de status
- ✅ **sucesso**
- ⚠️ **problema identificado (auto-corrigível)**
- 🚧 **bloqueador**

## Onde ficam clientes/configs do Supabase e como são usados
✅ **Cliente/config**
- **Arquivo**: `/home/giovanni-lopes/Dev/Personal/serena/src/lib/supabaseClient.ts`
- **Símbolo**: `supabase` (singleton via `createClient`)

```1:10:/home/giovanni-lopes/Dev/Personal/serena/src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("URL e chave de acesso são obrigatórios.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

✅ **Uso típico**
- **`src/services/*`** importa `supabase` e faz `.from(...).select/insert/update/delete`, `.auth.getUser()`, `.auth.signInWithPassword()`, `.storage...`, `.rpc(...)`.
  - Exemplos (símbolos):
    - `/src/services/auth.ts`: `signUp`, `signIn`, `signOut`, `getCurrentUser`, `resetPassword`, `updatePassword`, `updateProfile`
    - `/src/services/apiTasks.ts`: `getTasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`, `uncompleteTask`, etc.
    - `/src/services/apiShoppingLists.ts`: `getShoppingLists` (inclui listas próprias + compartilhadas)
    - `/src/services/apiProfile.ts`: `getCurrentProfile`, `createProfile`, `uploadAvatar`, etc.
- **`src/context/AuthContext.tsx`** usa `supabase.auth.onAuthStateChange` para manter o `user` no contexto.

## React Query: padrão de hooks e organização (services vs hooks)
✅ **Config do QueryClient**
- **Arquivo**: `/home/giovanni-lopes/Dev/Personal/serena/src/main.tsx`
- **Símbolo**: `queryClient` + `<QueryClientProvider>`

```1:22:/home/giovanni-lopes/Dev/Personal/serena/src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

✅ **Organização**
- **Camada “services” (I/O Supabase)**: `/home/giovanni-lopes/Dev/Personal/serena/src/services/*`
  - Funções async, retornam DTOs tipados (`Task`, `ShoppingList`, `UserProfile`, etc), e fazem mapeamento de campos `snake_case` → `camelCase`.
- **Camada “hooks” (React Query + UX)**:
  - “Feature hooks”: `/home/giovanni-lopes/Dev/Personal/serena/src/features/**/use*.ts(x)`
    - Ex.: `useTasks`, `useShoppingLists`, `useStickyNotes`, `useProjects`, `useHabits`, `useProfile`, `useSubtasks`, `useCountdowns`
  - Hooks auxiliares: `/home/giovanni-lopes/Dev/Personal/serena/src/hooks/*` (alguns também usam React Query, ex. `useSharedTaskIds`, `useAutoProfile`)
- **Padrão predominante**:
  - `useQuery({ queryKey: [...], queryFn: serviceFn })`
  - `useMutation({ mutationFn: serviceFn, onSuccess: invalidateQueries + toast, onError: console.error + toast })`

Exemplo típico (queryKey + invalidation):
```18:39:/home/giovanni-lopes/Dev/Personal/serena/src/features/shopping-lists/useShoppingLists.ts
export function useShoppingLists(workspaceId?: string) {
  return useQuery({
    queryKey: ["shopping-lists", workspaceId],
    queryFn: () => getShoppingLists(workspaceId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Lista de compras criada com sucesso!");
    },
```

## Problemas comuns encontrados (duplicação, chaves, erros, tipos)
⚠️ **Chaves de cache inconsistentes (bug real de invalidação)**
- **`shopping-lists` vs `shoppingLists`**:
  - Hooks usam `["shopping-lists", workspaceId]` e invalidam `["shopping-lists"]`
  - Mas `/src/components/ShareShoppingListModal.tsx` invalida `["shoppingLists"]` em alguns fluxos

```123:150:/home/giovanni-lopes/Dev/Personal/serena/src/components/ShareShoppingListModal.tsx
    queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    queryClient.invalidateQueries({ queryKey: ["sharedShoppingListIds"] });
  };

  const handleChangeRole = async (shareId: string, newRole: ShareRole) => {
    try {
      await updateShoppingListShareRole(shareId, newRole);
      toast.success("Permissão atualizada");
      const data = await getShoppingListShares(list.id);
      setShares(data);
      queryClient.invalidateQueries({ queryKey: ["shoppingLists"] });
      queryClient.invalidateQueries({ queryKey: ["sharedShoppingListIds"] });
```

⚠️ **`sticky-notes` vs `stickyNotes`**:
- Hook: `/src/features/sticky-notes/useStickyNotes.ts` usa `["sticky-notes"]`
- Modal: `/src/components/ShareStickyNoteModal.tsx` invalida `["stickyNotes"]`
  - Resultado provável: lista de post-its pode não refetch após compartilhar/revogar (cache fica “stale”).

⚠️ **Duplicação/repetição de configs do React Query**
- `QueryClient` já define `staleTime/gcTime`, mas vários hooks repetem esses valores localmente (ex.: `useTasks`, `useStickyNotes`, `useShoppingLists`).
- Risco: divergência futura (alguém ajusta um lugar e esquece os outros).

⚠️ **Manejo de erro repetido e inconsistente**
- Padrão espalhado: `console.error(...)` + `toast.error(...)` em quase toda mutation.
- Inconsistência no que é lançado pelos services:
  - alguns fazem `throw new Error("Falha ...")`
  - outros fazem `throw error` (erro do Supabase/PostgREST), o que muda shape (`message/code` etc.)
- Efeito colateral: hooks acabam fazendo parsing de string/código (ex.: em `useUpdateTask`/`useCompleteTask` checando `error.message` por `"P0001"` / `"pending"` / `"subtasks"`).

⚠️ **Tipagem fraca / `any` / `unknown`**
- `AuthContext` guarda `user: unknown | null` (`/src/context/AuthContext.tsx`) e `useAutoProfile` faz casts `(user as any)` para acessar `id/email/user_metadata` (`/src/hooks/useAutoProfile.ts`).
- Services com `any` em mapeamentos (ex.: subtasks e shopping list items):
  - `/src/services/apiTasks.ts` usa `subtask: any` no `map`
  - `/src/services/apiShoppingLists.ts` usa `sharedListsResult: any` e `item: any` no `map`
- Isso enfraquece o “contrato” entre camada de dados e UI.

⚠️ **Dois “sources of truth” para dados (React Query vs AppContext)**
- Existe um **AppContext** que carrega e guarda `tasks/projects/habits/countdowns/workspaces` via services (sem React Query):
  - `/src/context/AppContext.tsx` chama `getWorkspaces/getTasks` e depois carrega “secondary data”.
- Em paralelo, páginas usam React Query hooks para os mesmos dados (ex.: `/src/pages/Tasks.tsx` usa `useTasks()`).
- E ainda há `dispatch` alterando `state.tasks` em alguns pontos (ex.: completar/descompletar em `Calendar` e `ProjectTasksModal`), enquanto mutations via React Query também invalidam e refazem fetch.
  - Isso é terreno fértil para inconsistência visual e bugs “fantasma”.

Trecho do carregamento do AppContext:
```338:462:/home/giovanni-lopes/Dev/Personal/serena/src/context/AppContext.tsx
export function AppProvider({ children }: { children: ReactNode }) {
  const { appData, setAppData } = useAppStorage();
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(appReducer, getInitialState());
  // ...
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      dispatch({ type: "LOAD_DATA", payload: { /* zera tudo */ } });
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [workspaces, tasks] = await Promise.all([
          getWorkspaces(),
          getTasks(),
        ]);

        dispatch({ type: "LOAD_DATA", payload: { workspaces: finalWorkspaces, activeWorkspaceId, tasks, /* ... */ } });

        const [projects, habits, habitEntries, countdowns] = await Promise.all([
          getProjects(),
          getHabits(),
          getHabitEntries(),
          getCountdowns(),
        ]);

        dispatch({ type: "LOAD_SECONDARY_DATA", payload: { projects, habits, habitEntries, countdowns } });
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, appData?.activeWorkspaceId, appData.currentThemeId]);
```

⚠️ **Offline/cache paralelo ao React Query (não integrado)**
- `/src/hooks/useOfflineMode.ts` + `/src/hooks/useOfflineOperations.ts` implementam fila offline em `localStorage`, mas **`executeOfflineAction` é stub** (só `setTimeout` + `console.log`).
- Não há `react-query-persist` nem persister do cache do React Query.

## O que centralizar / componentizar
✅ **Recomendado centralizar**
- **Query keys**: um módulo único (ex.: `queryKeys.tasks.list()`, `queryKeys.shoppingLists.list(workspaceId)`) pra evitar `sticky-notes` vs `stickyNotes`, etc.
- **Invalidate helpers**: funções para invalidar todos os “relacionados” (ex.: completar task invalida tasks + projects) com chaves consistentes.
- **Normalização de erro**:
  - Uma função `toAppError(err)` que extraia `message`, `code`, `details` de `Error | PostgrestError | unknown`
  - Mapeamento de códigos (ex.: `PGRST116` já aparece em `apiProfile.ts`) num lugar só
- **Auth guard** para services**:
  - `requireUser()` (evita repetir `supabase.auth.getUser()` + `if (!user) throw...` em quase todo service)
- **Tipagem do Supabase**:
  - `createClient<Database>(...)` com tipos gerados do Supabase para reduzir `any` e mapeamentos manuais perigosos.
- **Error boundary**:
  - Não encontrei `ErrorBoundary`/`react-error-boundary` no código (busca sem matches). Hoje o fallback parece ser toast + logs; um boundary no topo do app ajudaria em crashes (inclusive o `throw` no `supabaseClient.ts`).

## Arquivos possivelmente redundantes/obsoletos
⚠️ **Provável redundância**
- `/home/giovanni-lopes/Dev/Personal/serena/src/services/index.ts`
  - Não encontrei imports de `../services` ou `../services/index` no `src/` (grep sem matches). Parece re-export não usado.
- ⚠️ **Sinal de refactor incompleto**: coexistência de **AppContext carregando dados via services** e **React Query hooks buscando os mesmos dados** (fonte dupla).

## Como testar (para validar os problemas encontrados)
✅ **Reprodução rápida das chaves inconsistentes**
- **Shopping lists**:
  - Abra a tela de listas, abra o modal de compartilhar (`ShareShoppingListModal`), altere role/revogue acesso.
  - Observe se a lista reflete mudanças sem refresh. A invalidação em `["shoppingLists"]` pode não refetch `["shopping-lists", workspaceId]`.
- **Sticky notes**:
  - Faça share/revoke no `ShareStickyNoteModal`.
  - Veja se `useStickyNotes()` refetch (hook usa `["sticky-notes"]`, modal invalida `["stickyNotes"]`).

## Sugestão de commit (se você decidir implementar as correções)
- **Nome**: `refactor(data): centralizar queryKeys e normalizar erros`
- **Descrição**: “Centraliza chaves do React Query e padroniza invalidações/erros do Supabase para evitar cache stale e duplicação de lógica de toast/erro.”

✅ **Commit realizado nesta análise**: nenhum (somente leitura).


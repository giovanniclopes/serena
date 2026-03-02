---
name: melhorias_codebase
overview: Plano priorizado para melhorar, remover e componentizar partes do codebase Serena, com foco em consistência (React Query), redução de duplicação (UI), remoção de código morto e ajuste de tooling.
todos:
  - id: rq-query-keys
    content: Criar módulo central de `queryKeys` e corrigir inconsistências (`shopping-lists` vs `shoppingLists`, `sticky-notes` vs `stickyNotes`) em hooks e modais.
    status: pending
  - id: profile-dead-links
    content: Remover/ocultar ou implementar rotas para `/settings`, `/privacy`, `/help` referenciadas em `src/pages/Profile.tsx`.
    status: pending
  - id: remove-dead-code
    content: "Confirmar e remover código não usado: `src/components/Navigation.tsx`, `src/services/index.ts`, `src/components/ui/{progress,separator,accessibility-colors}.tsx`."
    status: pending
  - id: modal-consolidation
    content: "Consolidar stack de modal: tornar `ui/modal` genérico com `description`, remover heurística por `title`, eliminar wrapper `src/components/Modal.tsx`, e garantir `ResponsiveModal` passe `description` no desktop."
    status: pending
  - id: card-unification
    content: Unificar `StandardCard` e `MobileCard` (escolher um base), migrar usos e remover o duplicado.
    status: pending
  - id: mobile-spacing-fix
    content: Corrigir `MobileSpacing` para evitar classes Tailwind dinâmicas não literais (usar mapa fixo ou styles inline).
    status: pending
  - id: nav-items-centralize
    content: Centralizar itens de navegação em um módulo único e atualizar `SideMenu`/`BottomNavbar` para consumir a mesma fonte.
    status: pending
  - id: appcontext-vs-reactquery
    content: "Planejar e executar migração para evitar fonte dupla de dados: reduzir `AppContext` para UI state e mover server state para React Query."
    status: pending
  - id: tooling-tailwind
    content: "Resolver inconsistência de Tailwind tooling (`@tailwindcss/vite` vs Tailwind v3): remover dependência não usada ou migrar Tailwind e configurar plugin."
    status: pending
  - id: offline-decision
    content: "Decidir caminho do offline: implementar `executeOfflineAction` real ou reduzir a feature para não prometer sync."
    status: pending
  - id: verify-build
    content: Após cada bloco de mudanças, rodar `pnpm lint` e `pnpm build`, e executar testes manuais dos fluxos afetados.
    status: pending
isProject: false
---

# Plano de melhorias, remoções e componentização (Serena)

## Objetivo

- Reduzir bugs e inconsistências (principalmente cache/invalidação do React Query e fonte dupla de dados).
- Remover código e rotas não usados que aumentam custo de manutenção.
- Consolidar componentes duplicados (modais, cards, navegação, inputs) para evitar “drift” de UX/estilo.
- Corrigir riscos de build (Tailwind dynamic classes, dependências inconsistentes).

## Contexto e evidências (principais)

- **Rotas e fallback**: rotas declaradas em `src/App.tsx`, com fallback `*` redirecionando para `/`. Links em `src/pages/Profile.tsx` apontam para rotas não declaradas (`/settings`, `/privacy`, `/help`).
- **React Query keys inconsistentes (bug provável)**:
  - Hooks usam `queryKey: ["shopping-lists", workspaceId]` em `src/features/shopping-lists/useShoppingLists.ts`.
  - `src/components/ShareShoppingListModal.tsx` invalida `queryKey: ["shoppingLists"]` em alguns fluxos.
  - Hooks usam `queryKey: ["sticky-notes"]` em `src/features/sticky-notes/useStickyNotes.ts`.
  - `src/components/ShareStickyNoteModal.tsx` invalida `queryKey: ["stickyNotes"]`.
- **Fonte dupla de verdade (risco de inconsistência)**: `src/context/AppContext.tsx` carrega e mantém `tasks/projects/habits/countdowns/...` enquanto `src/features/**/use*.ts(x)` usa React Query para os mesmos domínios.
- **UI duplicada/inconsistente**:
  - Modal: `src/components/ui/modal.tsx` infere descrição pelo `title`; `src/components/ResponsiveModal.tsx` aceita `description`, mas no desktop ela não é passada.
  - Wrapper redundante: `src/components/Modal.tsx` apenas reexporta o modal do `ui`.
  - Cards: `src/components/StandardCard.tsx` e `src/components/ui/mobile-card.tsx` são altamente sobrepostos.
- **Código possivelmente morto**:
  - `src/components/Navigation.tsx` não aparece importado/usado em `src/`.
  - `src/services/index.ts` (barrel export) não aparece importado/usado.
  - `src/components/ui/progress.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/accessibility-colors.tsx` não aparecem importados/usados.
- **Tailwind classes dinâmicas (risco no build)**: `src/components/ui/mobile-spacing.tsx` gera classes `p-[${value}]`, `m-[${value}]`, etc (não literais).
- **Tooling/deps**: `package.json` inclui `@tailwindcss/vite` junto de `tailwindcss@3.4.0`, mas `vite.config.ts` não usa o plugin.
- **Offline sync incompleto**: `src/hooks/useOfflineMode.ts` tem `executeOfflineAction` como stub.

## Estratégia de execução (ordem recomendada)

- Fazer primeiro mudanças **localizadas e seguras** (query keys, rotas/links, remoção de arquivos claramente mortos).
- Depois consolidar componentes base (Modal/Card/Nav) com migração gradual.
- Por fim atacar refactors de maior impacto (fonte dupla AppContext vs React Query; offline real).

## Workstreams

### A) Correções rápidas (baixo risco, alto retorno)

- Padronizar `queryKey` e invalidações (shopping lists e sticky notes) para evitar cache stale.
  - Arquivos afetados: `src/features/shopping-lists/useShoppingLists.ts`, `src/components/ShareShoppingListModal.tsx`, `src/features/sticky-notes/useStickyNotes.ts`, `src/components/ShareStickyNoteModal.tsx`.
  - Diretriz: criar um módulo central de chaves, ex.: `src/lib/queryKeys.ts` e substituir strings soltas.
- Ajustar links/rotas do Perfil:
  - Opção 1: remover/ocultar itens com `href` inexistente em `src/pages/Profile.tsx`.
  - Opção 2: criar páginas simples e rotas correspondentes em `src/App.tsx`.

### B) Remoção de código morto (após confirmar não uso)

- Remover `src/components/Navigation.tsx`.
- Remover `src/services/index.ts`.
- Remover `src/components/ui/progress.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/accessibility-colors.tsx`.
- Após cada remoção, rodar `pnpm build` para confirmar.

### C) Componentização e consistência de UI

- Consolidar modais:
  - Tornar `src/components/ui/modal.tsx` genérico e aceitar `description?: string`.
  - Remover heurística por `title`.
  - Eliminar wrapper `src/components/Modal.tsx` e fazer import direto do `ui/modal`.
  - Fazer `src/components/ResponsiveModal.tsx` passar `description` também no desktop.
- Unificar cards:
  - Escolher um componente base (preferência: `src/components/ui/mobile-card.tsx`).
  - Migrar usos de `src/components/StandardCard.tsx` para o card base e remover `StandardCard`.
- Normalizar inputs e formulários:
  - Definir padrão único: usar `src/components/ui/input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx` (ou wrappers), evitando `<input>` com `style={{...theme}}` espalhado.

### D) Navegação e arquitetura por feature

- Centralizar config de navegação:
  - Criar `src/navigation/navItems.ts` (ou similar) como fonte única para SideMenu/BottomNavbar.
  - Atualizar `src/components/SideMenu.tsx` e `src/components/BottomNavbar.tsx` para consumir essa config.
- Evoluir `src/features/`_ para “feature folders” completos (hooks + components + types), reduzindo páginas pesadas em `src/pages/`_.

### E) Build e tooling

- Resolver `@tailwindcss/vite` vs Tailwind v3:
  - Opção conservadora: remover `@tailwindcss/vite` se não for usado.
  - Opção maior: migrar Tailwind para v4 e adotar plugin adequadamente.
- Corrigir `MobileSpacing`:
  - Trocar classes dinâmicas por classes literais (map fixo) ou por `style={{ padding/margin/gap }}`.

### F) Offline (decisão de produto)

- Decidir se o app realmente suportará fila offline.
  - Se sim: implementar `executeOfflineAction` chamando services reais e invalidando queries.
  - Se não: remover UI/toasts que sugerem sync e manter apenas indicador de offline.

## Test plan (após cada etapa)

- `pnpm install`
- `pnpm lint`
- `pnpm build` (obrigatório)
- Testes manuais focados:
  - Shopping lists: compartilhar/revogar/trocar role e verificar atualização imediata da lista.
  - Sticky notes: compartilhar/revogar e verificar atualização imediata.
  - Perfil: clicar em Preferências/Privacidade/Ajuda e validar comportamento esperado.
  - Modais: abrir em mobile/desktop e validar título/descrição/scroll.
  - Cards: validar estilos/altura/padding em telas com `MobileCard`.
  - Navegação: SideMenu/BottomNavbar consistentes e rotas corretas.

## Notas de segurança

- Evitar mudanças de comportamento em massa sem isolar por etapa.
- Preferir alterações incrementais com build a cada conjunto pequeno de commits.

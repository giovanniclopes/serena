# Serena - Organize sua vida

Serena é um assistente pessoal inteligente que combina gerenciamento de tarefas com planejamento visual, hábitos e lista de compras, oferecendo uma experiência web responsiva e moderna. Com suporte a PWA, funcionalidades de IA via Gemini e autenticação segura via Supabase.

## ✨ Características Principais

### 🏠 Sistema de Workspaces

- **Múltiplos Espaços**: Crie espaços separados para diferentes áreas da vida (Pessoal, Trabalho, Faculdade)
- **Isolamento de Conteúdo**: Cada workspace funciona como um container independente
- **Temas Dinâmicos**: Cores personalizadas para cada workspace
- **Navegação Rápida**: Interface intuitiva para alternar entre espaços

### 📋 Gerenciamento de Tarefas

- **Hierarquia Completa**: Projetos → Tarefas → Subtarefas
- **Atributos Avançados**: Prioridades, lembretes, recorrência, tags
- **Visualizações**: Calendário (Hoje, Semana, Mês) e Lista
- **Filtros Inteligentes**: Busca por palavras-chave e filtros avançados
- **Assistência com IA**: Geração automática de subtarefas com Gemini

### 🛒 Gerenciamento de Listas de Compras

- **Múltiplas Listas**: Crie listas para diferentes categorias
- **Itens Rastreáveis**: Marque itens como comprados
- **Compartilhamento**: Compartilhe listas com outros usuários
- **Estatísticas**: Acompanhe gastos e itens frequentes

### 🎯 Sistema de Hábitos

- **Rastreamento Visual**: Heatmap de progresso
- **Metas Personalizáveis**: Defina metas diárias e acompanhe streaks
- **Lembretes**: Notificações para manter a consistência
- **Análise de Progresso**: Visualização clara do desempenho

### ⏰ Contagem Regressiva

- **Eventos Importantes**: Acompanhe datas especiais
- **Visualização Clara**: Contagem em dias, horas e minutos
- **Categorização**: Organize por workspace
- **Alertas**: Notificações para eventos próximos

### 📝 Anotações (Sticky Notes)

- **Notas Rápidas**: Crie anotações sem estrutura específica
- **Cores Personalizáveis**: Organize visualmente por cor
- **Compartilhamento**: Compartilhe anotações com outros usuários
- **Busca**: Encontre anotações rapidamente

### 🎨 Temas Personalizáveis

- **Temas Predefinidos**: Múltiplas opções de tema
- **Temas Dinâmicos**: Cores geradas automaticamente por workspace
- **Modo Escuro**: Suporte completo para tema escuro
- **Customização**: Sistema de cores baseado em HSL

### 🔐 Autenticação e Conta

- **Supabase Auth**: Sistema seguro de autenticação
- **Email com Verificação**: Processo de registro com confirmação
- **Recuperação de Senha**: Fluxo seguro de reset
- **Perfil Personalizável**: Customize suas preferências

### 📱 Funcionalidades Web App

- **PWA**: Instalável como aplicação nativa
- **Modo Offline**: Funciona sem conexão com internet
- **Service Worker**: Sincronização em background
- **Responsivo**: Funciona em qualquer dispositivo (desktop, tablet, mobile)

## 🚀 Como Usar

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd serena

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI (opcional, para funcionalidades de IA)
VITE_GOOGLE_AI_API=your_google_ai_api_key_here
VITE_ENABLE_AI_FEATURES=true
```

### Navegação e Secções

- **Início**: Visão geral com estatísticas, tarefas do dia e próximos eventos
- **Calendário**: Visualização mensal com tarefas organizadas por data
- **Tarefas**: Lista completa com filtros, busca e agrupamento
- **Projetos**: Organize tarefas por projetos
- **Hábitos**: Acompanhamento de rotinas com visualização em heatmap
- **Contagem Regressiva**: Acompanhe datas especiais
- **Listas de Compras**: Gerencie múltiplas listas de compras
- **Anotações**: Crie e organize anotações rápidas
- **Perfil**: Gerenciar preferências e conta

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React 19.2** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS 3.4** - Estilização utilitária
- **Vite 7.1** - Build tool e dev server
- **React Router 6.30** - Navegação SPA

### UI & Animações

- **Radix UI** - Componentes acessíveis
- **Lucide React 0.468** - Ícones
- **Framer Motion 12.23** - Animações avançadas
- **React Confetti** - Efeitos visuais

### Data & Utilitários

- **date-fns 4.1** - Manipulação de datas
- **dayjs 1.11** - Parsing de datas alternativo
- **Recharts 3.3** - Gráficos e visualizações

### Backend & Dados

- **Supabase** - Autenticação, banco de dados e auto-sync
- **React Query (@tanstack/react-query 5.90)** - Gerenciamento de estado e cache

### IA

- **Google Generative AI (@google/generative-ai 0.24)** - Integração com Gemini

### Outros

- **Sonner** - Notificações toast
- **jsPDF** - Exportação de PDFs
- **Vercel Analytics** - Análitica de uso

## 🎨 Design e UX

### Filosofia de Design

- **Minimalista**: Foco no conteúdo, não na interface
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Acessível**: Componentes Radix UI com suporte a navegação por teclado
- **Temas Personalizáveis**: Múltiplas opções visuais

### Animações e Feedback

- **Transições Suaves**: Animações fluidas entre estados com Framer Motion
- **Feedback Visual**: Respostas imediatas às ações do usuário
- **Indicadores de Loading**: Estados claros durante operações assíncronas
- **Notificações**: Toast notifications com Sonner

## 📊 Funcionalidades de IA

Com o Gemini AI integrado, Serena oferece:

- **Geração Automática**: Cria automáticamente subtarefas baseadas em descrições
- **Assistência Inteligente**: Sugestões e recomendações contextuais
- **Configurável**: Ative/desative conforme necessário
- **Rate-Limited**: Respeita os limites da API gratuita

## 🎯 Público-Alvo

Jovens adultos, estudantes e profissionais (20-35 anos) que valorizam:

- Funcionalidade robusta e bem organizada
- Design clean, moderno e personalizável
- Organização de metas acadêmicas e projetos pessoais
- Rastreamento de hábitos e bem-estar
- Acesso em múltiplos dispositivos

## 🔮 Funcionalidades em Desenvolvimento

- [x] Sistema de Workspaces com cores dinâmicas
- [x] Gerenciamento completo de tarefas
- [x] Rastreamento de hábitos
- [x] Integração com IA (Gemini)
- [x] Modo offline (PWA)
- [x] Listas de compras compartilháveis
- [x] Anotações rápidas
- [ ] Widgets para tela inicial
- [ ] Sincronização com calendários externos (Google Calendar, etc.)
- [ ] Relatórios de produtividade avançados
- [ ] Integração de voz
- [ ] Modo colaborativo em tempo real

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Serena** - Transformando produtividade em serenidade.

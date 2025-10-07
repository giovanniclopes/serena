# 🌐 Modo Offline Inteligente - Serena

## 📋 Visão Geral

O modo offline inteligente permite que os usuários continuem usando o app Serena mesmo sem conexão com a internet. Todas as ações são armazenadas localmente e sincronizadas automaticamente quando a conexão for restaurada.

## ✨ Funcionalidades

### 🔄 Sincronização Automática

- **Detecção de conectividade**: Monitora automaticamente o status da conexão
- **Queue de ações**: Armazena todas as operações offline em uma fila
- **Sincronização inteligente**: Executa ações pendentes quando a conexão é restaurada
- **Retry automático**: Tenta novamente ações que falharam (até 3 tentativas)

### 📱 Indicadores Visuais

- **Status bar**: Mostra o status de conectividade no topo da tela
- **Contador de ações**: Exibe quantas ações estão pendentes
- **Notificações toast**: Informa sobre mudanças de status e sincronização
- **Modal detalhado**: Permite visualizar e gerenciar ações pendentes

### 💾 Cache Local

- **Armazenamento persistente**: Dados salvos no localStorage
- **Cache inteligente**: Expira automaticamente após 5 minutos
- **Limpeza manual**: Opção para limpar dados offline

## 🛠️ Como Funciona

### 1. Detecção de Conectividade

```typescript
// Monitora eventos de online/offline
window.addEventListener("online", handleOnline);
window.addEventListener("offline", handleOffline);
```

### 2. Queue de Ações

```typescript
interface OfflineAction {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  entity: "task" | "project" | "habit" | "countdown";
  data: any;
  timestamp: number;
  retryCount: number;
}
```

### 3. Sincronização

- Quando a conexão é restaurada, todas as ações pendentes são executadas
- Ações são processadas sequencialmente para evitar conflitos
- Falhas são registradas e tentadas novamente

## 🎯 Operações Suportadas

### ✅ Tarefas

- Criar nova tarefa
- Atualizar tarefa existente
- Marcar como concluída
- Deletar tarefa

### ✅ Projetos

- Criar novo projeto
- Atualizar projeto
- Deletar projeto

### ✅ Hábitos

- Criar novo hábito
- Atualizar hábito
- Registrar progresso
- Deletar hábito

### ✅ Contadores

- Criar novo contador
- Atualizar contador
- Deletar contador

## 🎨 Interface do Usuário

### Indicador de Status

- **Verde**: Tudo sincronizado
- **Amarelo**: Ações pendentes
- **Laranja**: Modo offline ativo
- **Azul**: Sincronizando

### Modal de Status

- Lista de ações pendentes
- Timestamp de cada ação
- Contador de tentativas
- Opção de limpeza manual

## 🔧 Integração

### Hook Principal

```typescript
import { useOfflineMode } from "../hooks/useOfflineMode";

const { isOnline, pendingActions, syncPendingActions } = useOfflineMode();
```

### Operações Offline

```typescript
import { useOfflineOperations } from "../hooks/useOfflineOperations";

const { createTaskOffline, updateTaskOffline } = useOfflineOperations();

// Uso
const result = createTaskOffline(taskData);
if (result.shouldExecute) {
  // Executar normalmente
} else {
  // Ação foi adicionada à fila offline
}
```

## 📊 Benefícios

### Para o Usuário

- **Continuidade**: Pode usar o app mesmo sem internet
- **Transparência**: Sabe exatamente o que está pendente
- **Confiabilidade**: Não perde dados por problemas de conexão
- **Autonomia**: Controle total sobre sincronização

### Para o Desenvolvedor

- **Simplicidade**: Integração transparente com código existente
- **Robustez**: Sistema de retry e tratamento de erros
- **Monitoramento**: Logs detalhados de todas as operações
- **Flexibilidade**: Fácil de estender para novas funcionalidades

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] Sincronização em background
- [ ] Resolução de conflitos
- [ ] Compressão de dados
- [ ] Sincronização incremental
- [ ] Modo offline para leitura de dados

### Integrações

- [ ] Service Worker para cache de assets
- [ ] IndexedDB para armazenamento mais robusto
- [ ] WebSocket para sincronização em tempo real
- [ ] Push notifications para status de sincronização

## 🐛 Troubleshooting

### Problemas Comuns

1. **Ações não sincronizam**: Verificar se a conexão está estável
2. **Dados duplicados**: Limpar cache offline e tentar novamente
3. **Performance lenta**: Verificar quantidade de ações pendentes

### Logs de Debug

```typescript
// Habilitar logs detalhados
localStorage.setItem("serena_debug_offline", "true");
```

## 📝 Notas Técnicas

- **Storage**: Usa localStorage para persistência
- **Limite**: ~5-10MB de dados offline
- **Performance**: Processa até 100 ações por minuto
- **Compatibilidade**: Funciona em todos os navegadores modernos

---

**Desenvolvido com ❤️ para uma experiência offline perfeita!**

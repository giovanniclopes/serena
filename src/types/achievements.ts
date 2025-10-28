export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category:
    | "tasks"
    | "habits"
    | "productivity"
    | "streak"
    | "milestone"
    | "projects";
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export const ACHIEVEMENTS: Omit<
  Achievement,
  "currentProgress" | "isUnlocked" | "unlockedAt"
>[] = [
  {
    id: "first_task",
    title: "Primeiro Passo",
    description: "Complete sua primeira tarefa",
    icon: "🎯",
    category: "tasks",
    requirement: 1,
    rarity: "common",
    xpReward: 10,
  },
  {
    id: "task_master_10",
    title: "Mestre das Tarefas",
    description: "Complete 10 tarefas",
    icon: "⭐",
    category: "tasks",
    requirement: 10,
    rarity: "common",
    xpReward: 25,
  },
  {
    id: "task_master_50",
    title: "Especialista em Produtividade",
    description: "Complete 50 tarefas",
    icon: "🏆",
    category: "tasks",
    requirement: 50,
    rarity: "rare",
    xpReward: 100,
  },
  {
    id: "task_master_100",
    title: "Lenda da Produtividade",
    description: "Complete 100 tarefas",
    icon: "👑",
    category: "tasks",
    requirement: 100,
    rarity: "epic",
    xpReward: 250,
  },
  {
    id: "task_master_500",
    title: "Deus da Produtividade",
    description: "Complete 500 tarefas",
    icon: "🌟",
    category: "tasks",
    requirement: 500,
    rarity: "legendary",
    xpReward: 500,
  },

  {
    id: "streak_3",
    title: "Em Construção",
    description: "Mantenha um streak de 3 dias",
    icon: "🔥",
    category: "streak",
    requirement: 3,
    rarity: "common",
    xpReward: 20,
  },
  {
    id: "streak_30",
    title: "Mês de Ouro",
    description: "Mantenha um streak de 30 dias",
    icon: "🏅",
    category: "streak",
    requirement: 30,
    rarity: "epic",
    xpReward: 200,
  },
  {
    id: "streak_100",
    title: "Lenda Viva",
    description: "Mantenha um streak de 100 dias",
    icon: "⚡",
    category: "streak",
    requirement: 100,
    rarity: "legendary",
    xpReward: 1000,
  },

  {
    id: "habit_creator",
    title: "Criador de Hábitos",
    description: "Crie seu primeiro hábito",
    icon: "🌱",
    category: "habits",
    requirement: 1,
    rarity: "common",
    xpReward: 15,
  },
  {
    id: "habit_master_5",
    title: "Mestre dos Hábitos",
    description: "Complete 5 hábitos diferentes",
    icon: "🎖️",
    category: "habits",
    requirement: 5,
    rarity: "rare",
    xpReward: 75,
  },

  {
    id: "early_bird",
    title: "Madrugador",
    description: "Complete uma tarefa antes das 8h",
    icon: "🌅",
    category: "milestone",
    requirement: 1,
    rarity: "common",
    xpReward: 30,
  },
  {
    id: "night_owl",
    title: "Coruja Noturna",
    description: "Complete uma tarefa após as 22h",
    icon: "🦉",
    category: "milestone",
    requirement: 1,
    rarity: "common",
    xpReward: 30,
  },
  {
    id: "weekend_warrior",
    title: "Guerreiro do Fim de Semana",
    description: "Complete tarefas em 5 fins de semana diferentes",
    icon: "⚔️",
    category: "milestone",
    requirement: 5,
    rarity: "rare",
    xpReward: 100,
  },
  {
    id: "speed_demon",
    title: "Demônio da Velocidade",
    description: "Complete 10 tarefas em um único dia",
    icon: "⚡",
    category: "milestone",
    requirement: 10,
    rarity: "epic",
    xpReward: 150,
  },
  {
    id: "perfectionist",
    title: "Perfeccionista",
    description: "Complete todas as tarefas de um dia sem nenhuma pendente",
    icon: "✨",
    category: "milestone",
    requirement: 1,
    rarity: "rare",
    xpReward: 80,
  },

  {
    id: "project_creator",
    title: "Arquiteto de Projetos",
    description: "Crie seu primeiro projeto",
    icon: "🏗️",
    category: "projects",
    requirement: 1,
    rarity: "common",
    xpReward: 20,
  },
  {
    id: "project_master_5",
    title: "Gerente de Projetos",
    description: "Crie 5 projetos diferentes",
    icon: "📊",
    category: "projects",
    requirement: 5,
    rarity: "rare",
    xpReward: 100,
  },
  {
    id: "project_completer",
    title: "Finalizador",
    description: "Complete um projeto inteiro",
    icon: "🎯",
    category: "projects",
    requirement: 1,
    rarity: "epic",
    xpReward: 200,
  },
  {
    id: "multitasker",
    title: "Multitarefas",
    description: "Complete tarefas de 3 categorias diferentes em um dia",
    icon: "🎪",
    category: "milestone",
    requirement: 1,
    rarity: "rare",
    xpReward: 120,
  },

  {
    id: "ill_be_back",
    title: "I'll be back",
    description: "Complete uma tarefa que foi desmarcada e marcada novamente",
    icon: "🤖",
    category: "milestone",
    requirement: 1,
    rarity: "common",
    xpReward: 40,
  },
  {
    id: "may_the_force",
    title: "Que a Força esteja com você",
    description: "Mantenha um streak de 7 dias consecutivos",
    icon: "⭐",
    category: "streak",
    requirement: 7,
    rarity: "rare",
    xpReward: 80,
  },
  {
    id: "to_infinity_beyond",
    title: "Ao infinito e além!",
    description: "Complete 100 tarefas",
    icon: "🚀",
    category: "tasks",
    requirement: 100,
    rarity: "epic",
    xpReward: 250,
  },
  {
    id: "great_power_responsibility",
    title: "Com grandes poderes vêm grandes responsabilidades",
    description: "Complete todas as tarefas de um projeto",
    icon: "🕷️",
    category: "projects",
    requirement: 1,
    rarity: "epic",
    xpReward: 200,
  },
  {
    id: "i_am_iron_man",
    title: "Eu sou o Homem de Ferro",
    description: "Complete 10 tarefas em um único dia",
    icon: "⚡",
    category: "milestone",
    requirement: 10,
    rarity: "epic",
    xpReward: 150,
  },
  {
    id: "back_to_future",
    title: "De Volta para o Futuro",
    description: "Complete uma tarefa que estava atrasada",
    icon: "⏰",
    category: "milestone",
    requirement: 1,
    rarity: "rare",
    xpReward: 90,
  },
];

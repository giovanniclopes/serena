import type { Project, Task } from "../types";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  defaultTasks: {
    title: string;
    description?: string;
    priority: "P1" | "P2" | "P3" | "P4";
    subtasks?: string[];
  }[];
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "book-club",
    name: "Clube do Livro",
    description: "Organize sua leitura com livros e capítulos",
    color: "#8B5CF6",
    icon: "book-open",
    defaultTasks: [
      {
        title: "Livro Atual",
        description: "Livro que estou lendo no momento",
        priority: "P1",
        subtasks: ["Capítulo 1", "Capítulo 2", "Capítulo 3"],
      },
      {
        title: "Próximo Livro",
        description: "Próximo livro da lista",
        priority: "P2",
        subtasks: [
          "Pesquisar sobre o livro",
          "Comprar/Emprestar",
          "Iniciar leitura",
        ],
      },
      {
        title: "Lista de Desejos",
        description: "Livros que quero ler",
        priority: "P3",
        subtasks: [
          "Adicionar recomendações",
          "Priorizar lista",
          "Definir ordem de leitura",
        ],
      },
    ],
  },
  {
    id: "language-learning",
    name: "Aprendizado de Idioma",
    description: "Estruture seu aprendizado com aulas e exercícios",
    color: "#10B981",
    icon: "languages",
    defaultTasks: [
      {
        title: "Aulas Regulares",
        description: "Sessões de estudo programadas",
        priority: "P1",
        subtasks: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
      },
      {
        title: "Exercícios Práticos",
        description: "Prática de gramática e vocabulário",
        priority: "P2",
        subtasks: ["Exercícios de gramática", "Vocabulário novo", "Pronúncia"],
      },
      {
        title: "Conversação",
        description: "Prática de conversação",
        priority: "P2",
        subtasks: [
          "Encontrar parceiro de conversa",
          "Marcar sessões",
          "Preparar tópicos",
        ],
      },
    ],
  },
  {
    id: "fitness-goal",
    name: "Meta de Fitness",
    description: "Organize seus objetivos de saúde e exercícios",
    color: "#F59E0B",
    icon: "dumbbell",
    defaultTasks: [
      {
        title: "Treinos Semanais",
        description: "Rotina de exercícios",
        priority: "P1",
        subtasks: [
          "Segunda - Cardio",
          "Quarta - Força",
          "Sexta - Flexibilidade",
        ],
      },
      {
        title: "Alimentação",
        description: "Planejamento alimentar",
        priority: "P2",
        subtasks: ["Planejar refeições", "Fazer compras", "Preparar alimentos"],
      },
      {
        title: "Acompanhamento",
        description: "Monitorar progresso",
        priority: "P3",
        subtasks: ["Pesar-se", "Medir medidas", "Registrar treinos"],
      },
    ],
  },
  {
    id: "study-project",
    name: "Projeto de Estudos",
    description: "Organize seus estudos e materiais",
    color: "#3B82F6",
    icon: "graduation-cap",
    defaultTasks: [
      {
        title: "Material de Estudo",
        description: "Organizar livros e recursos",
        priority: "P1",
        subtasks: [
          "Separar por matéria",
          "Organizar cronograma",
          "Preparar ambiente",
        ],
      },
      {
        title: "Exercícios",
        description: "Prática e revisão",
        priority: "P2",
        subtasks: ["Resolver exercícios", "Revisar erros", "Fazer simulados"],
      },
      {
        title: "Revisões",
        description: "Consolidar conhecimento",
        priority: "P2",
        subtasks: [
          "Fazer resumos",
          "Criar flashcards",
          "Revisar antes das provas",
        ],
      },
    ],
  },
  {
    id: "creative-project",
    name: "Projeto Criativo",
    description: "Desenvolva seus projetos artísticos e criativos",
    color: "#EC4899",
    icon: "palette",
    defaultTasks: [
      {
        title: "Planejamento",
        description: "Definir conceito e estrutura",
        priority: "P1",
        subtasks: ["Definir tema", "Criar esboços", "Escolher materiais"],
      },
      {
        title: "Execução",
        description: "Desenvolver o projeto",
        priority: "P1",
        subtasks: ["Fase inicial", "Desenvolvimento", "Finalização"],
      },
      {
        title: "Apresentação",
        description: "Compartilhar o resultado",
        priority: "P3",
        subtasks: [
          "Documentar processo",
          "Preparar apresentação",
          "Compartilhar",
        ],
      },
    ],
  },
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return projectTemplates.find((template) => template.id === id);
}

export function createProjectFromTemplate(
  template: ProjectTemplate,
  workspaceId: string
): {
  project: Omit<Project, "id" | "createdAt" | "updatedAt">;
  tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[];
} {
  const project: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
    name: template.name,
    description: template.description,
    color: template.color,
    icon: template.icon,
    workspaceId,
  };

  const tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] =
    template.defaultTasks.map((task) => ({
      title: task.title,
      description: task.description,
      projectId: "", // Será preenchido após criar o projeto
      parentTaskId: undefined,
      subtasks: [],
      dueDate: undefined,
      priority: task.priority,
      reminders: [],
      tags: [],
      isCompleted: false,
      completedAt: undefined,
      workspaceId,
    }));

  return { project, tasks };
}

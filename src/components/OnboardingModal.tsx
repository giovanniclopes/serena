import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import CounterSplash from "../assets/vectors/CounterSplash";
import HabitSplash from "../assets/vectors/HabitSplash";
import ProjectSplash from "../assets/vectors/ProjectSplash";
import ScheduleSplash from "../assets/vectors/ScheduleSplash";
import TaskSplash from "../assets/vectors/TasksSplash";
import { useApp } from "../context/AppContext";
import { adjustColorBrightness } from "../utils/colorUtils";
import { Button } from "./ui/button";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingPages = [
  {
    id: "counter",
    title: "Contadores",
    description:
      "Acompanhe o tempo e mantenha o foco com nossos contadores personalizáveis. Ideal para técnicas como Pomodoro e sessões de estudo.",
    features: [
      "Contadores personalizáveis",
      "Notificações sonoras",
      "Histórico de sessões",
      "Técnicas de produtividade",
    ],
    vector: CounterSplash,
  },
  {
    id: "habits",
    title: "Hábitos",
    description:
      "Construa e mantenha hábitos positivos com nosso sistema de acompanhamento. Visualize seu progresso e mantenha a consistência.",
    features: [
      "Acompanhamento diário",
      "Estatísticas de progresso",
      "Lembretes personalizados",
      "Gamificação de hábitos",
    ],
    vector: HabitSplash,
  },
  {
    id: "projects",
    title: "Projetos",
    description:
      "Organize seus projetos de forma eficiente. Defina metas, acompanhe o progresso e mantenha tudo organizado em um só lugar.",
    features: [
      "Gestão de projetos",
      "Metas e objetivos",
      "Acompanhamento de progresso",
      "Templates personalizáveis",
    ],
    vector: ProjectSplash,
  },
  {
    id: "schedule",
    title: "Agenda",
    description:
      "Mantenha sua agenda organizada com nosso calendário intuitivo. Agende compromissos, eventos e nunca perca um prazo importante.",
    features: [
      "Calendário visual",
      "Lembretes automáticos",
      "Sincronização de eventos",
      "Agenda compartilhada",
    ],
    vector: ScheduleSplash,
  },
  {
    id: "tasks",
    title: "Tarefas",
    description:
      "Gerencie suas tarefas de forma eficiente. Crie listas, defina prioridades e acompanhe o progresso de tudo que precisa ser feito.",
    features: [
      "Listas de tarefas",
      "Prioridades e categorias",
      "Subtarefas organizadas",
      "Acompanhamento de progresso",
    ],
    vector: TaskSplash,
  },
];

export default function OnboardingModal({
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPageData = onboardingPages[currentPage];
  const VectorComponent = currentPageData.vector;

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="lg:w-1/2 p-8 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {onboardingPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsAnimating(true);
                        setTimeout(() => {
                          setCurrentPage(index);
                          setIsAnimating(false);
                        }, 150);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentPage
                          ? "scale-110"
                          : index < currentPage
                          ? "hover:opacity-80"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      style={{
                        backgroundColor:
                          index === currentPage
                            ? state.currentTheme.colors.primary
                            : index < currentPage
                            ? adjustColorBrightness(
                                state.currentTheme.colors.primary,
                                0.7
                              )
                            : undefined,
                      }}
                    >
                      {index < currentPage && (
                        <Check size={12} className="text-white m-0.5" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      ((currentPage + 1) / onboardingPages.length) * 100
                    }%`,
                  }}
                />
              </div>

              <div className="text-right mt-2">
                <span className="text-sm text-gray-500">
                  {currentPage + 1} de {onboardingPages.length}
                </span>
              </div>
            </div>

            <div
              className={`flex-1 flex flex-col justify-center transition-opacity duration-300 ${
                isAnimating ? "opacity-50" : "opacity-100"
              }`}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentPageData.title}
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {currentPageData.description}
              </p>

              <div className="space-y-3 mb-8">
                {currentPageData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: state.currentTheme.colors.primary,
                      }}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft size={20} />
                <span>Anterior</span>
              </Button>

              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
                style={{
                  backgroundColor: state.currentTheme.colors.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = adjustColorBrightness(
                    state.currentTheme.colors.primary,
                    0.8
                  );
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    state.currentTheme.colors.primary;
                }}
              >
                <span>
                  {currentPage === onboardingPages.length - 1
                    ? "Começar"
                    : "Próximo"}
                </span>
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2 bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-8">
            <div
              className={`w-full max-w-md transition-transform duration-300 ${
                isAnimating ? "scale-95" : "scale-100"
              }`}
            >
              <VectorComponent className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

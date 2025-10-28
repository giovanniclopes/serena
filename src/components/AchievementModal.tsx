import { Crown, Star, Trophy, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAchievements } from "../hooks/useAchievements";

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const rarityIcons = {
  common: <Star className="w-4 h-4 text-gray-500" />,
  rare: <Star className="w-4 h-4 text-blue-400" />,
  epic: <Zap className="w-4 h-4 text-purple-400" />,
  legendary: <Crown className="w-4 h-4 text-yellow-400" />,
};

const rarityColors = {
  common: "border-gray-300 bg-gray-50",
  rare: "border-blue-300 bg-blue-50",
  epic: "border-purple-300 bg-purple-50",
  legendary: "border-yellow-300 bg-yellow-50",
};

export default function AchievementModal({
  isOpen,
  onClose,
}: AchievementModalProps) {
  const { state } = useApp();
  const {
    achievements,
    progress,
    getUnlockedAchievements,
    getTotalXP,
    clearNewlyUnlocked,
  } = useAchievements();

  const [activeTab, setActiveTab] = useState<"all" | "unlocked" | "locked">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      clearNewlyUnlocked();
    }
  }, [isOpen, clearNewlyUnlocked]);

  const filteredAchievements = achievements.filter((achievement) => {
    if (activeTab === "unlocked") return achievement.isUnlocked;
    if (activeTab === "locked") return !achievement.isUnlocked;
    if (selectedCategory !== "all")
      return achievement.category === selectedCategory;
    return true;
  });

  const categories = [
    { id: "all", name: "Todas", icon: "🏆" },
    { id: "tasks", name: "Tarefas", icon: "📋" },
    { id: "habits", name: "Hábitos", icon: "🎯" },
    { id: "streak", name: "Sequências", icon: "🔥" },
    { id: "milestone", name: "Marcos", icon: "⭐" },
    { id: "projects", name: "Projetos", icon: "🏗️" },
  ];

  const totalXP = getTotalXP();
  const unlockedCount = getUnlockedAchievements().length;
  const totalCount = achievements.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy
                className="w-8 h-8"
                style={{ color: state.currentTheme.colors.primary }}
              />
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Conquistas
                </h2>
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {unlockedCount} de {totalCount} desbloqueadas • {totalXP} XP
                  total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex space-x-1 mt-4">
            {[
              { id: "all", label: "Todas" },
              { id: "unlocked", label: "Desbloqueadas" },
              { id: "locked", label: "Bloqueadas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "all" | "unlocked" | "locked")
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? state.currentTheme.colors.primary
                      : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? state.currentTheme.colors.secondary
                      : "transparent",
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                style={{ color: state.currentTheme.colors.textSecondary }}
              />
              <p
                className="text-lg font-medium"
                style={{ color: state.currentTheme.colors.text }}
              >
                Nenhuma conquista encontrada
              </p>
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Tente ajustar os filtros ou continue usando o app para
                desbloquear conquistas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((achievement) => {
                const progressData = progress.find(
                  (p) => p.achievementId === achievement.id
                );
                const progressPercentage = progressData
                  ? Math.min(
                      (progressData.currentValue / achievement.requirement) *
                        100,
                      100
                    )
                  : 0;

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      achievement.isUnlocked
                        ? rarityColors[achievement.rarity]
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {achievement.title}
                          </h3>
                          <p
                            className="text-sm"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {rarityIcons[achievement.rarity]}
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {achievement.xpReward} XP
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          Progresso
                        </span>
                        <span
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {progressData?.currentValue || 0} /{" "}
                          {achievement.requirement}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: achievement.isUnlocked
                              ? state.currentTheme.colors.success
                              : state.currentTheme.colors.primary,
                            width: `${progressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {achievement.isUnlocked ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">
                          Desbloqueada{" "}
                          {achievement.unlockedAt &&
                            new Date(achievement.unlockedAt).toLocaleDateString(
                              "pt-BR"
                            )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm">Bloqueada</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

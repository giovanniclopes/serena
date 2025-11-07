import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Habit, Project, Task } from "../types";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allTasks = state.tasks.filter(
    (t) => t.workspaceId === state.activeWorkspaceId
  );
  const allProjects = state.projects.filter(
    (p) => p.workspaceId === state.activeWorkspaceId
  );
  const allHabits = state.habits.filter(
    (h) => h.workspaceId === state.activeWorkspaceId
  );

  const searchTasks = (query: string): Task[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const searchProjects = (query: string): Project[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const searchHabits = (query: string): Habit[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allHabits.filter((habit) =>
      habit.name.toLowerCase().includes(lowerQuery)
    );
  };

  const tasks = searchTasks(searchQuery);
  const projects = searchProjects(searchQuery);
  const habits = searchHabits(searchQuery);

  const allResults = [
    ...tasks.map((t) => ({ type: "task" as const, item: t })),
    ...projects.map((p) => ({ type: "project" as const, item: p })),
    ...habits.map((h) => ({ type: "habit" as const, item: h })),
  ];

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(allResults[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allResults]);

  const handleSelectResult = (result: {
    type: "task" | "project" | "habit";
    item: Task | Project | Habit;
  }) => {
    onClose();
    if (result.type === "task") {
      navigate("/tasks");
    } else if (result.type === "project") {
      navigate("/projects");
    } else if (result.type === "habit") {
      navigate("/habits");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b">
          <Search
            className="w-5 h-5 flex-shrink-0"
            style={{ color: state.currentTheme.colors.textSecondary }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar tarefas, projetos, hábitos..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: state.currentTheme.colors.text }}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.textSecondary,
              backgroundColor: state.currentTheme.colors.textSecondary + "10",
            }}
            aria-label="Fechar busca"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {searchQuery.trim() && allResults.length === 0 ? (
            <div className="p-8 text-center">
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Nenhum resultado encontrado para "{searchQuery}"
              </p>
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-2">
              {tasks.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-xs font-semibold px-2 py-1 mb-2"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Tarefas ({tasks.length})
                  </p>
                  {tasks.slice(0, 5).map((task) => {
                    const resultIndex = allResults.findIndex(
                      (r) => r.type === "task" && r.item.id === task.id
                    );
                    return (
                      <button
                        key={task.id}
                        onClick={() =>
                          handleSelectResult({ type: "task", item: task })
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                          selectedIndex === resultIndex
                            ? "bg-opacity-20"
                            : "hover:bg-opacity-10"
                        }`}
                        style={{
                          backgroundColor:
                            selectedIndex === resultIndex
                              ? state.currentTheme.colors.primary
                              : state.currentTheme.colors.surface,
                          color: state.currentTheme.colors.text,
                        }}
                      >
                        <div className="font-medium text-sm">{task.title}</div>
                        {task.description && (
                          <div
                            className="text-xs truncate"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {task.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {projects.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-xs font-semibold px-2 py-1 mb-2"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Projetos ({projects.length})
                  </p>
                  {projects.slice(0, 5).map((project) => {
                    const resultIndex = allResults.findIndex(
                      (r) => r.type === "project" && r.item.id === project.id
                    );
                    return (
                      <button
                        key={project.id}
                        onClick={() =>
                          handleSelectResult({ type: "project", item: project })
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                          selectedIndex === resultIndex
                            ? "bg-opacity-20"
                            : "hover:bg-opacity-10"
                        }`}
                        style={{
                          backgroundColor:
                            selectedIndex === resultIndex
                              ? state.currentTheme.colors.primary
                              : state.currentTheme.colors.surface,
                          color: state.currentTheme.colors.text,
                        }}
                      >
                        <div className="font-medium text-sm">{project.name}</div>
                        {project.description && (
                          <div
                            className="text-xs truncate"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {project.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {habits.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-xs font-semibold px-2 py-1 mb-2"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Hábitos ({habits.length})
                  </p>
                  {habits.slice(0, 5).map((habit) => {
                    const resultIndex = allResults.findIndex(
                      (r) => r.type === "habit" && r.item.id === habit.id
                    );
                    return (
                      <button
                        key={habit.id}
                        onClick={() =>
                          handleSelectResult({ type: "habit", item: habit })
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                          selectedIndex === resultIndex
                            ? "bg-opacity-20"
                            : "hover:bg-opacity-10"
                        }`}
                        style={{
                          backgroundColor:
                            selectedIndex === resultIndex
                              ? state.currentTheme.colors.primary
                              : state.currentTheme.colors.surface,
                          color: state.currentTheme.colors.text,
                        }}
                      >
                        <div className="font-medium text-sm">{habit.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Digite para buscar tarefas, projetos e hábitos
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Use as setas ↑↓ para navegar e Enter para selecionar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


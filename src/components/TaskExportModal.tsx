import { FileText, File, FileJson } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Task } from "../types";
import { formatDate, formatTime, getPriorityLabel } from "../utils";

interface TaskExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export default function TaskExportModal({
  isOpen,
  onClose,
  tasks,
}: TaskExportModalProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Lista de Tarefas", 20, 20);

      doc.setFontSize(12);
      let yPosition = 40;

      tasks.forEach((task, index) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text(`${index + 1}. ${task.title}`, 20, yPosition);
        yPosition += 8;

        if (task.description) {
          doc.setFontSize(10);
          doc.text(`   Descrição: ${task.description}`, 20, yPosition);
          yPosition += 6;
        }

        const project = state.projects.find((p) => p.id === task.projectId);
        if (project) {
          doc.text(`   Projeto: ${project.name}`, 20, yPosition);
          yPosition += 6;
        }

        doc.text(
          `   Prioridade: ${getPriorityLabel(task.priority)}`,
          20,
          yPosition
        );
        yPosition += 6;

        if (task.dueDate) {
          doc.text(
            `   Data de vencimento: ${formatDate(task.dueDate)}`,
            20,
            yPosition
          );
          yPosition += 6;
        }

        doc.text(
          `   Status: ${task.isCompleted ? "Concluída" : "Pendente"}`,
          20,
          yPosition
        );
        yPosition += 6;

        if (task.tags.length > 0) {
          const taskTags = state.tags.filter((tag) =>
            task.tags.includes(tag.id)
          );
          doc.text(
            `   Tags: ${taskTags.map((tag) => tag.name).join(", ")}`,
            20,
            yPosition
          );
          yPosition += 6;
        }

        if (task.subtasks.length > 0) {
          doc.text(`   Subtarefas (${task.subtasks.length}):`, 20, yPosition);
          yPosition += 6;
          task.subtasks.forEach((subtask, subIndex) => {
            doc.text(
              `     ${subIndex + 1}. ${subtask.title} ${
                subtask.isCompleted ? "✓" : "○"
              }`,
              20,
              yPosition
            );
            yPosition += 5;
          });
        }

        yPosition += 10;
      });

      doc.save("tarefas.pdf");
      onClose();
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      alert("Erro ao exportar para PDF. Tente novamente.");
    }
  };

  const exportToTXT = () => {
    let content = "LISTA DE TAREFAS\n";
    content += "================\n\n";

    tasks.forEach((task, index) => {
      content += `${index + 1}. ${task.title}\n`;

      if (task.description) {
        content += `   Descrição: ${task.description}\n`;
      }

      const project = state.projects.find((p) => p.id === task.projectId);
      if (project) {
        content += `   Projeto: ${project.name}\n`;
      }

      content += `   Prioridade: ${getPriorityLabel(task.priority)}\n`;

      if (task.dueDate) {
        content += `   Data de vencimento: ${formatDate(task.dueDate)}`;
        if (task.dueDate.getHours() !== 0) {
          content += ` às ${formatTime(task.dueDate)}`;
        }
        content += "\n";
      }

      content += `   Status: ${task.isCompleted ? "Concluída" : "Pendente"}\n`;

      if (task.tags.length > 0) {
        const taskTags = state.tags.filter((tag) => task.tags.includes(tag.id));
        content += `   Tags: ${taskTags.map((tag) => tag.name).join(", ")}\n`;
      }

      if (task.subtasks.length > 0) {
        content += `   Subtarefas (${task.subtasks.length}):\n`;
        task.subtasks.forEach((subtask, subIndex) => {
          content += `     ${subIndex + 1}. ${subtask.title} ${
            subtask.isCompleted ? "✓" : "○"
          }\n`;
        });
      }

      content += "\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tarefas.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTasks: tasks.length,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        project: state.projects.find((p) => p.id === task.projectId)?.name,
        priority: task.priority,
        priorityLabel: getPriorityLabel(task.priority),
        dueDate: task.dueDate?.toISOString(),
        dueDateFormatted: task.dueDate ? formatDate(task.dueDate) : null,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt?.toISOString(),
        tags: state.tags
          .filter((tag) => task.tags.includes(tag.id))
          .map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
          })),
        subtasks: task.subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.title,
          description: subtask.description,
          isCompleted: subtask.isCompleted,
          completedAt: subtask.completedAt?.toISOString(),
          priority: subtask.priority,
          priorityLabel: getPriorityLabel(subtask.priority),
          dueDate: subtask.dueDate?.toISOString(),
          dueDateFormatted: subtask.dueDate
            ? formatDate(subtask.dueDate)
            : null,
          tags: state.tags
            .filter((tag) => subtask.tags.includes(tag.id))
            .map((tag) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color,
            })),
          totalTimeSpent: subtask.totalTimeSpent,
          createdAt: subtask.createdAt,
          updatedAt: subtask.updatedAt,
        })),
        totalTimeSpent: task.totalTimeSpent,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tarefas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: state.currentTheme.colors.text }}
        >
          Exportar Tarefas
        </h3>
        <p
          className="text-sm mb-6"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Escolha o formato para exportar {tasks.length} tarefa
          {tasks.length !== 1 ? "s" : ""}:
        </p>

        <div className="space-y-3">
          <button
            onClick={exportToPDF}
            className="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50"
            style={{
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          >
            <FileText className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <div className="font-medium">PDF</div>
              <div
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Documento formatado para impressão
              </div>
            </div>
          </button>

          <button
            onClick={exportToTXT}
            className="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50"
            style={{
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          >
            <File className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">TXT</div>
              <div
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Arquivo de texto simples
              </div>
            </div>
          </button>

          <button
            onClick={exportToJSON}
            className="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50"
            style={{
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          >
            <FileJson className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <div className="font-medium">JSON</div>
              <div
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Dados estruturados para integração
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              color: state.currentTheme.colors.textSecondary,
              border: `1px solid ${state.currentTheme.colors.border}`,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

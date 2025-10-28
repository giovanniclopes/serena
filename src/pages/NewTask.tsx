import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import { useCreateTask } from "../features/tasks/useTasks";
import { createTask } from "../services/apiTasks";
import type { Task } from "../types";

export default function NewTask() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(true);
  const createTaskMutation = useCreateTask();

  const handleSaveTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> => {
    try {
      const result = await createTask({
        ...taskData,
        workspaceId: state.activeWorkspaceId,
      });

      createTaskMutation.reset();

      return result;
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsTaskModalOpen(false);
    navigate("/tasks");
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: state.currentTheme.colors.background }}
    >
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCancel}
        onSave={handleSaveTask}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          navigate("/tasks");
        }}
      />
    </div>
  );
}

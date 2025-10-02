import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import { useCreateTask } from "../features/tasks/useTasks";
import type { Task } from "../types";

export default function NewTask() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(true);
  const createTaskMutation = useCreateTask();

  const handleSaveTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    createTaskMutation.mutate(
      {
        ...taskData,
        workspaceId: state.activeWorkspaceId,
      },
      {
        onSuccess: () => {
          setIsTaskModalOpen(false);
          navigate("/tasks");
        },
      }
    );
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
      />
    </div>
  );
}

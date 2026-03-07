import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi, type Schedule } from "../api/schedule";
import { availabilityApi, type DailyAvailability } from "../api/availability";
import { Plus, Settings, Sparkles, Clock } from "lucide-react";
import CalendarView from "../components/schedule/CalendarView";
import TaskModal from "../components/schedule/TaskModal";
import AvailabilityPanel from "../components/schedule/AvailabilityPanel";
import AIScheduleModal from "../components/schedule/AIScheduleModal";
import Toast from "../components/ui/Toast";
import ErrorMessage from "../components/ui/ErrorMessage";
import DeleteConfirmationModal from "../components/ui/DeleteConfirmationModal";

const SchedulePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive date from URL or default to today
  const selectedDate = useMemo(() => {
    const dateFromUrl = searchParams.get("date");
    if (dateFromUrl) {
      const parsed = new Date(dateFromUrl);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [searchParams]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Schedule | null>(null);
  const [taskDeleting, setTaskDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
    undo?: () => void;
  } | null>(null);

  const {
    data: schedules = [],
    isLoading: loadingSchedules,
    error: scheduleError,
    refetch: refetchSchedules,
  } = useQuery<Schedule[]>({
    queryKey: ["schedules"],
    queryFn: () => scheduleApi.getSchedules(),
  });

  const {
    data: availability = [],
    isLoading: loadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useQuery<DailyAvailability[]>({
    queryKey: ["availability"],
    queryFn: availabilityApi.getAllAvailability,
  });

  const deleteMutation = useMutation({
    mutationFn: scheduleApi.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      scheduleApi.updateSchedule(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: scheduleApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const handleDateSelect = React.useCallback(
    (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setSearchParams({ date: `${year}-${month}-${day}` });
    },
    [setSearchParams],
  );

  const handleCreateTask = React.useCallback(() => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }, []);

  const handleEditTask = React.useCallback((task: Schedule) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleDeleteTask = React.useCallback((taskId: string) => {
    setTaskDeleting(taskId);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!taskDeleting) return;

    try {
      const taskId = taskDeleting;
      const taskToDelete = (schedules as Schedule[]).find(
        (s) => s._id === taskId,
      );
      await deleteMutation.mutateAsync(taskId);
      setTaskDeleting(null);

      setToast({
        message: "Task deleted",
        type: "success",
        undo: async () => {
          if (taskToDelete) {
            await createMutation.mutateAsync({
              title: taskToDelete.title,
              description: taskToDelete.description,
              date: taskToDelete.date.split("T")[0],
              startTime: taskToDelete.startTime,
              endTime: taskToDelete.endTime,
              subjectId: taskToDelete.subjectId,
            });
          }
        },
      });
    } catch (err: unknown) {
      console.error("Failed to delete task:", err);
      setToast({ message: "Failed to delete task", type: "error" });
    }
  }, [taskDeleting, schedules, deleteMutation, createMutation]);

  const handleTaskSaved = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }, [queryClient]);

  const handleAvailabilitySaved = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  }, [queryClient]);

  const handleToggleTaskComplete = React.useCallback(
    async (taskId: string) => {
      const task = (schedules as Schedule[]).find((s) => s._id === taskId);
      if (!task) return;

      try {
        await toggleMutation.mutateAsync({
          id: taskId,
          completed: !task.completed,
        });
      } catch (err: unknown) {
        console.error("Failed to toggle task:", err);
        setToast({ message: "Failed to update task", type: "error" });
      }
    },
    [schedules, toggleMutation],
  );

  const isLoading = loadingSchedules || loadingAvailability;
  const error = scheduleError || availabilityError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Clock className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Schedule</h1>
          <p className="text-sm text-gray-400">
            Manage your study schedule and availability
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAvailabilityOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 text-sm"
          >
            <Settings size={16} />
            <span className="hidden md:inline">Availability</span>
          </button>
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all duration-300 border border-emerald-500/20 text-sm"
          >
            <Sparkles size={16} />
            <span className="hidden md:inline">AI Generate</span>
          </button>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-300 font-medium text-sm"
          >
            <Plus size={16} />
            <span className="hidden md:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={
            error instanceof Error ? error.message : "Failed to load data"
          }
          onRetry={() => {
            refetchSchedules();
            refetchAvailability();
          }}
          className="my-4"
        />
      )}

      {/* Calendar View */}
      {!error && (
        <CalendarView
          schedules={schedules as Schedule[]}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onTaskClick={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskToggle={handleToggleTaskComplete}
        />
      )}

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={!!taskDeleting}
        onClose={() => setTaskDeleting(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This session will be removed from your schedule."
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSaved}
        task={editingTask}
        selectedDate={selectedDate}
      />

      <AvailabilityPanel
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        availability={availability as DailyAvailability[]}
        onSave={handleAvailabilitySaved}
      />

      <AIScheduleModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerated={() =>
          queryClient.invalidateQueries({ queryKey: ["schedules"] })
        }
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onUndo={toast.undo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SchedulePage;

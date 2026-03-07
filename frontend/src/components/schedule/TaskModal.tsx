import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  type Schedule,
  scheduleApi,
  type CreateScheduleData,
} from "../../api/schedule";
import { getSubjects } from "../../api/subject";
import type { Subject } from "../../types/subject";
import { X, Calendar, Clock, BookOpen, ExternalLink } from "lucide-react";
import ErrorMessage from "../ui/ErrorMessage";
import Button from "../ui/Button";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  task: Schedule | null;
  selectedDate: Date;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  selectedDate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setDate(task.date.split("T")[0]);
        setStartTime(task.startTime);
        setEndTime(task.endTime);
        setSubjectId(task.subjectId || "");
        setDifficulty(task.difficulty || "medium");
      } else {
        setTitle("");
        setDescription("");
        setDate(selectedDate.toISOString().split("T")[0]);
        setStartTime("09:00");
        setEndTime("10:00");
        setSubjectId("");
        setDifficulty("medium");
      }
    }
  }, [isOpen, task, selectedDate]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: CreateScheduleData = {
        title,
        description,
        date,
        startTime,
        endTime,
        subjectId: subjectId || undefined,
        difficulty,
      };

      if (task) {
        await scheduleApi.updateSchedule(task._id, data);
      } else {
        await scheduleApi.createSchedule(data);
      }

      onSave();
    } catch (err: unknown) {
      console.error("Failed to save task:", err);
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setError(axiosError.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 ">
        {/* Header */}
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-2">
          {error && <ErrorMessage message={error} className="mb-4" />}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              placeholder="Study session title"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Clock size={16} className="inline mr-1" />
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <BookOpen size={16} className="inline mr-1" />
              Subject (Optional)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="" className="bg-black">
                No subject
              </option>
              {subjects.map((subject) => (
                <option
                  key={subject._id}
                  value={subject._id}
                  className="bg-black"
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick links (subject / topic resources) */}
          {(() => {
            const selectedSubject = subjects.find((s) => s._id === subjectId);
            const allTopics = selectedSubject?.chapters?.flatMap(
              (c) => c.topics ?? [],
            ) ?? [];
            const selectedTopic = task?.topicId
              ? allTopics.find((t) => t._id === task.topicId)
              : null;
            const subjectLinks = selectedSubject?.resourceLinks ?? [];
            const topicLinks = selectedTopic?.resourceLinks ?? [];
            const hasLinks =
              subjectLinks.length > 0 || topicLinks.length > 0;
            if (!hasLinks) return null;
            return (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Quick links
                </p>
                <div className="space-y-1.5">
                  {subjectLinks.map((link, i) => (
                    <a
                      key={`s-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-(--accent-emerald) hover:underline"
                    >
                      <ExternalLink size={12} />
                      {link.label || "Link"}
                    </a>
                  ))}
                  {topicLinks.map((link, i) => (
                    <a
                      key={`t-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-emerald-400/90 hover:underline"
                    >
                      <ExternalLink size={12} />
                      {link.label || "Link"}
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="easy" className="bg-black">
                Easy
              </option>
              <option value="medium" className="bg-black">
                Medium
              </option>
              <option value="hard" className="bg-black">
                Hard
              </option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1 rounded-xl py-3"
            >
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default TaskModal;

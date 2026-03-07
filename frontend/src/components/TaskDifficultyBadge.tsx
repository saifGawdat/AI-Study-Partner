import React from "react";
import { Zap } from "lucide-react";

interface TaskDifficultyBadgeProps {
  difficulty?: string;
  size?: "sm" | "md" | "lg";
}

const TaskDifficultyBadge: React.FC<TaskDifficultyBadgeProps> = ({
  difficulty = "medium",
  size = "md",
}) => {
  const getDifficultyConfig = (diff: string) => {
    const normalized = (diff || "medium").toLowerCase().trim();
    switch (normalized) {
      case "easy":
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/40",
          text: "text-emerald-300",
          label: "Easy",
          icon: null,
        };
      case "hard":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/40",
          text: "text-red-300",
          label: "Hard",
          icon: <Zap size={12} />,
        };
      case "medium":
      default:
        return {
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/40",
          text: "text-yellow-300",
          label: "Medium",
          icon: null,
        };
    }
  };

  const config = getDifficultyConfig(difficulty);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full border ${config.bg} ${config.border} ${config.text} font-medium whitespace-nowrap`}
    >
      {config.icon}
      {config.label}
    </div>
  );
};

export default TaskDifficultyBadge;

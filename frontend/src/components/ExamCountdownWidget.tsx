import React from "react";
import { Calendar, AlertCircle } from "lucide-react";
import type { Subject } from "../types/subject";

interface ExamCountdownWidgetProps {
  subjects: Subject[];
}

const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  subjects,
}) => {
  const upcomingExams = React.useMemo(() => {
    return subjects
      .filter((s) => s.examDate)
      .map((s) => {
        const examDate = new Date(s.examDate!);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil(
          (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        return { ...s, daysLeft, examDate };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subjects]);

  if (upcomingExams.length === 0) {
    return null;
  }

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return "from-red-500 to-red-600";
    if (daysLeft <= 7) return "from-yellow-500 to-yellow-600";
    return "from-(--accent-emerald) to-(--accent-emerald-dark)";
  };

  const getUrgencyBg = (daysLeft: number) => {
    if (daysLeft <= 3) return "bg-red-500/10 border-red-500/20";
    if (daysLeft <= 7) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-(--accent-emerald)/10 border-(--accent-emerald)/20";
  };

  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-(--accent-emerald)" size={20} />
        <h2 className="text-xl font-bold text-white">Upcoming Exams</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcomingExams.slice(0, 6).map((exam) => (
          <div
            key={exam._id}
            className={`p-4 rounded-lg border ${getUrgencyBg(exam.daysLeft)} backdrop-blur-sm transition-all hover:scale-105`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1 truncate">
                  {exam.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {exam.examDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div
                className={`flex items-center justify-center min-w-14 h-14 rounded-lg bg-linear-to-br ${getUrgencyColor(exam.daysLeft)} text-white font-bold text-lg flex-shrink-0`}
              >
                {exam.daysLeft < 0 ? "Today" : `${exam.daysLeft}d`}
              </div>
            </div>
            {exam.daysLeft <= 3 && exam.daysLeft > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-yellow-400">
                <AlertCircle size={14} />
                <span className="text-xs font-medium">Urgent!</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamCountdownWidget;

import React from "react";
import { CheckCircle2, AlertTriangle, Clock, CalendarCheck } from "lucide-react";
import type { PredictionResult } from "../../api/analytics";

interface PredictionCardsProps {
  predictions: PredictionResult[];
}

const PredictionCards: React.FC<PredictionCardsProps> = ({ predictions }) => {
  if (predictions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Add subjects with exam dates to see predictions.
      </div>
    );
  }

  const getPaceStyles = (
    pace: PredictionResult["currentPace"],
    message: string,
  ) => {
    const isExamPassed = message.toLowerCase().includes("exam already passed");
    if (isExamPassed) {
      return {
        bg: "bg-gray-500/10 border-gray-500/30",
        icon: CalendarCheck,
        iconColor: "text-gray-400",
      };
    }
    switch (pace) {
      case "ahead":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30",
          icon: CheckCircle2,
          iconColor: "text-emerald-500",
        };
      case "at-risk":
        return {
          bg: "bg-red-500/10 border-red-500/30",
          icon: AlertTriangle,
          iconColor: "text-red-500",
        };
      default:
        return {
          bg: "bg-amber-500/10 border-amber-500/30",
          icon: Clock,
          iconColor: "text-amber-500",
        };
    }
  };

  return (
    <div className="grid gap-4">
      {predictions.map((p) => {
        const styles = getPaceStyles(p.currentPace, p.message);
        const Icon = styles.icon;
        return (
          <div
            key={p.subjectId}
            className={`p-4 rounded-xl border ${styles.bg}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${styles.iconColor}`} />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white">{p.subjectName}</h4>
                {p.examDate && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Exam: {new Date(p.examDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    {p.daysUntilDeadline != null && p.daysUntilDeadline > 0 && (
                      <> • {p.daysUntilDeadline} days left</>
                    )}
                  </p>
                )}
                <p className="text-sm text-gray-300 mt-2">{p.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionCards;

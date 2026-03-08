import React from "react";
import type { WeeklySubjectCompletion } from "../../api/analytics";

interface SubjectHeatmapProps {
  data: WeeklySubjectCompletion[];
}

/** Interpolate color from red (0%) to green (100%) */
function getColorForRate(rate: number): string {
  if (rate === 0) return "rgba(255,255,255,0.08)";
  const r = Math.round(255 * (1 - rate / 100));
  const g = Math.round(255 * (rate / 100));
  return `rgb(${r}, ${g}, 80)`;
}

const WEEK_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4"];

const SubjectHeatmap: React.FC<SubjectHeatmapProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No subject data in the last 30 days.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4">
              Subject
            </th>
            {WEEK_LABELS.map((l) => (
              <th
                key={l}
                className="text-center text-xs font-medium text-gray-500 py-2 px-1 min-w-12"
              >
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.subjectId} className="group">
              <td className="py-2 pr-4">
                <span className="font-medium text-white text-sm truncate block max-w-[120px]">
                  {item.subjectName}
                </span>
              </td>
              {item.weeks.map((w) => (
                <td key={w.weekIndex} className="px-1 py-1">
                  <div
                    className="w-10 h-8 mx-auto rounded flex items-center justify-center text-xs font-medium transition-transform group-hover:scale-110 cursor-default"
                    style={{
                      backgroundColor: getColorForRate(w.rate),
                      color: w.rate > 50 ? "#fff" : w.rate > 0 ? "#000" : "#6b7280",
                    }}
                    title={`${item.subjectName}: ${w.rate.toFixed(0)}% (${w.completed}/${w.total} tasks completed)`}
                  >
                    {w.total > 0 ? `${w.rate.toFixed(0)}%` : "-"}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectHeatmap;

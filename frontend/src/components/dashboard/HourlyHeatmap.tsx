import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { HourlyData } from "../../api/analytics";

interface HourlyHeatmapProps {
  data: HourlyData[];
}

const HourlyHeatmap: React.FC<HourlyHeatmapProps> = React.memo(({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.taskCount), 1);
  const peakHour = data.reduce(
    (best, d) => (d.taskCount > best.taskCount ? d : best),
    data[0] || { hour: 0, taskCount: 0 },
  );

  const chartData = data.map((d) => ({
    ...d,
    label:
      d.hour === 0
        ? "12am"
        : d.hour < 12
          ? `${d.hour}am`
          : d.hour === 12
            ? "12pm"
            : `${d.hour - 12}pm`,
    isPeak: d.hour === peakHour?.hour && peakHour.taskCount > 0,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="taskCount"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} tasks completed`,
              `${props.payload.hour}:00 - ${props.payload.hour + 1}:00`,
            ]}
          />
          <Bar dataKey="taskCount" radius={[4, 4, 0, 0]} animationDuration={800}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.isPeak
                    ? "#10b981"
                    : entry.taskCount > 0
                      ? `rgba(16, 185, 129, ${0.4 + 0.5 * (entry.taskCount / maxCount)})`
                      : "rgba(255, 255, 255, 0.08)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {peakHour?.taskCount > 0 && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Peak productivity: {peakHour.hour}:00–{peakHour.hour + 1}:00 ({peakHour.taskCount} tasks)
        </p>
      )}
    </div>
  );
});

HourlyHeatmap.displayName = "HourlyHeatmap";

export default HourlyHeatmap;

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

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  // Format date to show short day name (e.g., "Mon")
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    return {
      ...item,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <XAxis
            dataKey="day"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1500}>
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.count > 0
                    ? "rgb(16, 185, 129)"
                    : "rgba(255, 255, 255, 0.1)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;

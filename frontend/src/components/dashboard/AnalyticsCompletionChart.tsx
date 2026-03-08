import React from "react";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyCompletion } from "../../api/analytics";

interface AnalyticsCompletionChartProps {
  data: DailyCompletion[];
}

const AnalyticsCompletionChart: React.FC<AnalyticsCompletionChartProps> =
  React.memo(({ data }) => {
  const formattedData = React.useMemo(() => {
    return data.map((item) => {
      const date = new Date(item.date);
      return {
        ...item,
        displayDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [data]);

  const avgRate =
    formattedData.length > 0
      ? formattedData.reduce((s, d) => s + d.rate, 0) / formattedData.length
      : 0;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Completion"]}
            labelFormatter={(_, payload) => {
              const p = payload[0]?.payload;
              return p ? `${p.displayDate} • ${p.taskCount} tasks` : "";
            }}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#completionGradient)"
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Avg completion: {avgRate.toFixed(1)}% • Last 30 days
      </p>
    </div>
  );
});

AnalyticsCompletionChart.displayName = "AnalyticsCompletionChart";

export default AnalyticsCompletionChart;

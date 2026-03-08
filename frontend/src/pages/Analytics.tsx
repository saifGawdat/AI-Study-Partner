import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import * as analyticsApi from "../api/analytics";
import AnalyticsCompletionChart from "../components/dashboard/AnalyticsCompletionChart";
import SubjectHeatmap from "../components/dashboard/SubjectHeatmap";
import PredictionCards from "../components/dashboard/PredictionCards";
import HourlyHeatmap from "../components/dashboard/HourlyHeatmap";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";

const Analytics: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: analyticsApi.fetchAnalyticsSummary,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto">
        <ErrorMessage
          message={
            error instanceof Error ? error.message : "Failed to load analytics"
          }
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const hasData =
    data &&
    (data.monthly.dailyCompletion.some((d) => d.taskCount > 0) ||
      data.monthly.subjectPerformance.length > 0 ||
      data.monthly.weeklySubjectCompletion?.length > 0 ||
      data.hourly.some((h) => h.taskCount > 0) ||
      data.predictions.length > 0);

  if (!hasData) {
    return (
      <div className="max-w-6xl mx-auto font-sans text-(--text-primary)">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-white/70 mb-6">
          Track your study trends and predictions.
        </p>
        <div className="text-center py-16 rounded-2xl bg-[#151515] border border-white/5">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No data available
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Complete some tasks over the next few days to see your completion
            trends, subject performance, and exam predictions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans text-(--text-primary)">
      <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
      <p className="text-white/70 mb-8">
        Completion trends, subject performance, and exam predictions (last 30
        days).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly completion chart */}
        <div className="p-6 rounded-2xl bg-[#151515] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Completion Rate
          </h3>
          <AnalyticsCompletionChart data={data!.monthly.dailyCompletion} />
        </div>

        {/* Subject heatmap */}
        <div className="p-6 rounded-2xl bg-[#151515] border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">
            Subject Performance (4 weeks)
          </h3>
          <SubjectHeatmap
            data={data!.monthly.weeklySubjectCompletion || []}
          />
        </div>

        {/* Prediction cards */}
        <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">
            Exam Completion Predictions
          </h3>
          <PredictionCards predictions={data!.predictions} />
        </div>

        {/* Hourly heatmap */}
        <div className="p-6 rounded-2xl bg-[#151515] border border-white/5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">
            Productivity by Hour
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            When you complete tasks (last 30 days)
          </p>
          <HourlyHeatmap data={data!.hourly} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;

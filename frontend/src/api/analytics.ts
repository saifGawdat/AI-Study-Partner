import apiClient from "./apiClient";

export interface DailyCompletion {
  date: string;
  rate: number;
  taskCount: number;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  completionRate: number;
  totalMinutes: number;
}

export interface WeeklySubjectCompletion {
  subjectId: string;
  subjectName: string;
  weeks: { weekIndex: number; completed: number; total: number; rate: number }[];
}

export interface HourlyData {
  hour: number;
  completionRate: number;
  taskCount: number;
}

export interface PredictionResult {
  subjectId: string;
  subjectName: string;
  examDate: string | null;
  currentPace: "on-track" | "at-risk" | "ahead";
  predictedDate: string | null;
  daysUntilDeadline: number | null;
  message: string;
}

export interface AnalyticsSummary {
  monthly: {
    dailyCompletion: DailyCompletion[];
    subjectPerformance: SubjectPerformance[];
    weeklySubjectCompletion: WeeklySubjectCompletion[];
  };
  hourly: HourlyData[];
  predictions: PredictionResult[];
}

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  try {
    const response = await apiClient.get<AnalyticsSummary>("/analytics/summary");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch analytics summary:", error);
    throw error;
  }
};

import apiClient from "./apiClient";

export interface Schedule {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  isAIGenerated: boolean;
  completed: boolean;
  difficulty?: string; // easy, medium, hard
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleData {
  title: string;
  description?: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficulty?: string; // easy, medium, hard
}

export interface GenerateScheduleData {
  startDate: string | Date;
  endDate: string | Date;
  prioritySubjects?: string[];
}

export const scheduleApi = {
  // Get all schedules with optional filters
  getSchedules: async (filters?: {
    startDate?: string;
    endDate?: string;
    subjectId?: string;
    completed?: boolean;
  }): Promise<Schedule[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.subjectId) params.append("subjectId", filters.subjectId);
    if (filters?.completed !== undefined)
      params.append("completed", String(filters.completed));

    const response = await apiClient.get(`/schedule?${params.toString()}`);
    return response.data;
  },

  // Create a new schedule
  createSchedule: async (data: CreateScheduleData): Promise<Schedule> => {
    const response = await apiClient.post("/schedule", data);
    return response.data;
  },

  // Update a schedule
  updateSchedule: async (
    id: string,
    data: Partial<CreateScheduleData> & { completed?: boolean },
  ): Promise<Schedule> => {
    const response = await apiClient.put(`/schedule/${id}`, data);
    return response.data;
  },

  // Delete a schedule
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule/${id}`);
  },

  // Get schedule statistics
  getStatistics: async (): Promise<{
    totalTasks: number;
    completedTasks: number;
    upcomingTasks: number;
    completionRate: number;
  }> => {
    const response = await apiClient.get("/schedule/stats");
    return response.data;
  },

  // Generate AI-powered schedule
  generateSchedule: async (
    data: GenerateScheduleData,
  ): Promise<{ message: string; schedules: Schedule[] }> => {
    const response = await apiClient.post("/schedule/generate", data);
    return response.data;
  },
};

import apiClient from "./apiClient";

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DailyAvailability {
  _id: string;
  userId: string;
  dayOfWeek: number;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetAvailabilityData {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
  isAvailable?: boolean;
}

export const availabilityApi = {
  // Get all availability settings
  getAllAvailability: async (): Promise<DailyAvailability[]> => {
    const response = await apiClient.get("/availability");
    return response.data;
  },

  // Get availability for a specific day
  getDayAvailability: async (day: number): Promise<DailyAvailability> => {
    const response = await apiClient.get(`/availability/${day}`);
    return response.data;
  },

  // Set or update availability for a day
  setAvailability: async (
    data: SetAvailabilityData,
  ): Promise<DailyAvailability> => {
    const response = await apiClient.post("/availability", data);
    return response.data;
  },

  // Delete availability for a day
  deleteAvailability: async (day: number): Promise<void> => {
    await apiClient.delete(`/availability/${day}`);
  },

  // Get weekly hours summary
  getWeeklyHours: async (): Promise<{ weeklyHours: number }> => {
    const response = await apiClient.get("/availability/stats/weekly-hours");
    return response.data;
  },
};

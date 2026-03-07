import apiClient from "./apiClient";

interface AuthResponse {
  user: {
    email: string;
    timezone: string;
    availability: {
      weekdayMinutes: number;
      weekendMinutes: number;
    };
  };
}

export const authApi = {
  signup: async (data: Record<string, unknown>): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },
  login: async (data: Record<string, unknown>): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },
  loginWithGoogle: async (credential: string): Promise<AuthResponse> => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await apiClient.post("/auth/google", {
      credential,
      timezone,
    });
    return response.data;
  },
  me: async (): Promise<AuthResponse["user"]> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/auth");
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};

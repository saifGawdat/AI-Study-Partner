import { useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export interface User {
  email: string;
  timezone: string;
  availability: {
    weekdayMinutes: number;
    weekendMinutes: number;
  };
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Cleanup legacy tokens on mount
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth_token");
  }, []);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: Record<string, string>) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authApi.login({ email, password, timezone });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: Record<string, string>) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authApi.signup({ email, password, timezone });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: (credential: string) => authApi.loginWithGoogle(credential),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
      // Clear legacy tokens from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("auth_token");
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      queryClient.clear(); // Clear all cached data on logout
    },
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      await signupMutation.mutateAsync({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      await googleLoginMutation.mutateAsync(credential);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (_err) {
      console.error("Logout failed:", _err);
    }
  };

  // Error handling
  let error: string | null = null;
  if (loginMutation.error) {
    error = axios.isAxiosError(loginMutation.error)
      ? loginMutation.error.response?.data?.message || "Login failed"
      : "Login failed";
  } else if (signupMutation.error) {
    error = axios.isAxiosError(signupMutation.error)
      ? signupMutation.error.response?.data?.message || "Signup failed"
      : "Signup failed";
  } else if (googleLoginMutation.error) {
    error = axios.isAxiosError(googleLoginMutation.error)
      ? googleLoginMutation.error.response?.data?.message || "Google sign-in failed"
      : "Google sign-in failed";
  }

  return {
    user: user ?? null,
    isLoading,
    error,
    login,
    signup,
    loginWithGoogle,
    isGoogleLoading: googleLoginMutation.isPending,
    logout,
  };
};

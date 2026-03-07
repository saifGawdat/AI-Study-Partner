import apiClient from "./apiClient";
import type { Subject } from "../types/subject";

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

export const getSubject = async (id: string): Promise<Subject> => {
  const response = await apiClient.get(`/subjects/${id}`);
  return response.data;
};

export const createSubject = async (
  subject: Partial<Subject>,
): Promise<Subject> => {
  const response = await apiClient.post("/subjects", subject);
  return response.data;
};

export const updateSubject = async (
  id: string,
  subject: Partial<Subject>,
): Promise<Subject> => {
  const response = await apiClient.put(`/subjects/${id}`, subject);
  return response.data;
};

export const deleteSubject = async (id: string): Promise<void> => {
  await apiClient.delete(`/subjects/${id}`);
};

export const getStats = async (): Promise<{
  finishedToday: number;
  streak: number;
  totalSubjects: number;
  activityData: { date: string; count: number }[];
}> => {
  const response = await apiClient.get("/subjects/stats");
  return response.data;
};

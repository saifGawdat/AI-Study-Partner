import apiClient from "./apiClient";

export type MilestoneCategory = "streak" | "tasks" | "subjects" | "rate";
export type MilestoneRarity = "common" | "rare" | "epic" | "legendary";

export interface Milestone {
  key: string;
  title: string;
  description: string;
  howTo: string;
  icon: string;
  category: MilestoneCategory;
  threshold: number;
  rarity: MilestoneRarity;
  unlocked: boolean;
  progress: number;
  current: number;
}

export interface MilestoneSummary {
  total: number;
  unlocked: number;
  streak: number;
  completedTasks: number;
  completionRate: number;
  subjectCount: number;
}

export interface MilestonesResponse {
  milestones: Milestone[];
  summary: MilestoneSummary;
}

export const gamificationApi = {
  getMilestones: async (): Promise<MilestonesResponse> => {
    const response = await apiClient.get("/gamification/milestones");
    return response.data;
  },
};

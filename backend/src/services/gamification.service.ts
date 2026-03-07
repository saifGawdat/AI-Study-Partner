import { ScheduleService } from "./schedule.service";
import Subject from "../models/Subject";

export interface MilestoneDefinition {
  key: string;
  title: string;
  description: string;
  howTo: string;
  icon: string;
  category: "streak" | "tasks" | "subjects" | "rate";
  threshold: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Streak
  {
    key: "STREAK_3",
    title: "Momentum",
    description: "Studied 3 days in a row",
    howTo: "Complete at least one task on 3 consecutive days.",
    icon: "🔥",
    category: "streak",
    threshold: 3,
    rarity: "common",
  },
  {
    key: "STREAK_7",
    title: "7-Day Warrior",
    description: "Maintained a 7-day streak",
    howTo: "Complete at least one task every day for 7 consecutive days.",
    icon: "⚡",
    category: "streak",
    threshold: 7,
    rarity: "rare",
  },
  {
    key: "STREAK_14",
    title: "Two-Week Titan",
    description: "Maintained a 14-day streak",
    howTo: "Complete at least one task every day for 14 consecutive days.",
    icon: "🌟",
    category: "streak",
    threshold: 14,
    rarity: "epic",
  },
  {
    key: "STREAK_30",
    title: "The Iron Scholar",
    description: "Maintained a 30-day streak",
    howTo: "Complete at least one task every day for 30 consecutive days.",
    icon: "🏆",
    category: "streak",
    threshold: 30,
    rarity: "legendary",
  },
  // Tasks
  {
    key: "TASKS_10",
    title: "Getting Started",
    description: "Completed 10 study sessions",
    howTo: "Complete 10 scheduled tasks or finish 10 topics.",
    icon: "📚",
    category: "tasks",
    threshold: 10,
    rarity: "common",
  },
  {
    key: "TASKS_50",
    title: "Dedicated Learner",
    description: "Completed 50 study sessions",
    howTo: "Complete 50 scheduled tasks or finish 50 topics.",
    icon: "🎓",
    category: "tasks",
    threshold: 50,
    rarity: "rare",
  },
  {
    key: "TASKS_100",
    title: "Century Club",
    description: "Completed 100 study sessions",
    howTo: "Complete 100 scheduled tasks or finish 100 topics.",
    icon: "💯",
    category: "tasks",
    threshold: 100,
    rarity: "epic",
  },
  {
    key: "TASKS_500",
    title: "Study Legend",
    description: "Completed 500 study sessions",
    howTo: "Complete 500 scheduled tasks or finish 500 topics.",
    icon: "👑",
    category: "tasks",
    threshold: 500,
    rarity: "legendary",
  },
  // Subjects
  {
    key: "SUBJECTS_3",
    title: "Multi-Tasker",
    description: "Managing 3 subjects simultaneously",
    howTo: "Add at least 3 subjects to your subject list.",
    icon: "📖",
    category: "subjects",
    threshold: 3,
    rarity: "common",
  },
  {
    key: "SUBJECTS_5",
    title: "Polymath",
    description: "Managing 5 subjects at once",
    howTo: "Add at least 5 subjects to your subject list.",
    icon: "🧠",
    category: "subjects",
    threshold: 5,
    rarity: "rare",
  },
  // Rate
  {
    key: "RATE_80",
    title: "High Achiever",
    description: "80% or higher completion rate",
    howTo: "Complete 80% or more of all your scheduled tasks.",
    icon: "🎯",
    category: "rate",
    threshold: 80,
    rarity: "rare",
  },
  {
    key: "RATE_95",
    title: "Perfectionist",
    description: "95% or higher completion rate",
    howTo: "Complete 95% or more of all your scheduled tasks.",
    icon: "💎",
    category: "rate",
    threshold: 95,
    rarity: "legendary",
  },
];

export class GamificationService {
  static async getMilestones(userId: string) {
    const [stats, subjectCount] = await Promise.all([
      ScheduleService.getStatistics(userId),
      Subject.countDocuments({ userId }),
    ]);

    const currentValues: Record<MilestoneDefinition["category"], number> = {
      streak: stats.streak,
      tasks: stats.completedTasks,
      subjects: subjectCount,
      rate: Math.floor(stats.completionRate),
    };

    const milestones = MILESTONE_DEFINITIONS.map((def) => {
      const current = currentValues[def.category];
      const unlocked = current >= def.threshold;
      const progress = Math.min(
        Math.floor((current / def.threshold) * 100),
        100,
      );
      return { ...def, unlocked, progress, current };
    });

    const summary = {
      total: milestones.length,
      unlocked: milestones.filter((m) => m.unlocked).length,
      streak: stats.streak,
      completedTasks: stats.completedTasks,
      completionRate: Math.floor(stats.completionRate),
      subjectCount,
    };

    return { milestones, summary };
  }
}

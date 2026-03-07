import { z } from "zod";

// Time format validation (HH:mm)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const difficultyEnum = z.enum(["easy", "medium", "hard"]);

export const createScheduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  date: z.string().or(z.date()),
  startTime: z.string().regex(timeRegex, "Invalid time format (use HH:mm)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (use HH:mm)"),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  completed: z.boolean().optional(),
  difficulty: difficultyEnum.optional(),
});

export const updateScheduleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().or(z.date()).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  completed: z.boolean().optional(),
  difficulty: difficultyEnum.optional(),
});

export const generateScheduleSchema = z.object({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  prioritySubjects: z.array(z.string()).optional(),
});

export const timeSlotSchema = z.object({
  startTime: z.string().regex(timeRegex, "Invalid time format (use HH:mm)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (use HH:mm)"),
});

export const dailyAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  timeSlots: z.array(timeSlotSchema),
  isAvailable: z.boolean().optional(),
});

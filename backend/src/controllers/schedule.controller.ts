import { Request, Response } from "express";
import { ScheduleService } from "../services/schedule.service";
import {
  createScheduleSchema,
  updateScheduleSchema,
  generateScheduleSchema,
} from "../validation/schedule.validation";
import { AIService } from "../services/ai.service";
import Subject from "../models/Subject";
import { AvailabilityService } from "../services/availability.service";
import mongoose from "mongoose";

export class ScheduleController {
  // Create a new schedule
  static async createSchedule(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const validatedData = createScheduleSchema.parse(req.body);

      const scheduleData: any = {
        ...validatedData,
        date: new Date(validatedData.date),
      };

      if (validatedData.subjectId) {
        scheduleData.subjectId = new mongoose.Types.ObjectId(
          validatedData.subjectId,
        );
      }

      const schedule = await ScheduleService.createSchedule(
        userId,
        scheduleData,
      );

      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get all schedules with optional filters
  static async getSchedules(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { startDate, endDate, subjectId, completed } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (subjectId) filters.subjectId = subjectId as string;
      if (completed !== undefined) filters.completed = completed === "true";

      const schedules = await ScheduleService.getSchedules(userId, filters);
      res.json(schedules);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update a schedule
  static async updateSchedule(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const validatedData = updateScheduleSchema.parse(req.body);

      const updates: any = { ...validatedData };
      if (validatedData.date) updates.date = new Date(validatedData.date);
      if (validatedData.subjectId) {
        updates.subjectId = new mongoose.Types.ObjectId(
          validatedData.subjectId,
        );
      }

      const schedule = await ScheduleService.updateSchedule(
        id,
        userId,
        updates,
      );

      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a schedule
  static async deleteSchedule(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await ScheduleService.deleteSchedule(id, userId);
      res.json({ message: "Schedule deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get schedule statistics
  static async getStatistics(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await ScheduleService.getStatistics(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // AI-powered schedule generation
  static async generateSchedule(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const validatedData = generateScheduleSchema.parse(req.body);

      // Get user's subjects
      const subjects = await Subject.find({ userId, finished: false });

      if (subjects.length === 0) {
        return res.status(400).json({
          message: "No active subjects found. Please add subjects first.",
        });
      }

      // Get user's availability
      const availability = await AvailabilityService.getAllAvailability(userId);

      if (availability.length === 0) {
        return res.status(400).json({
          message:
            "No availability settings found. Please set your availability first.",
        });
      }

      // Generate schedule using AI
      const generatedTasks = await AIService.generateSchedule(
        userId,
        subjects,
        availability,
        new Date(validatedData.startDate),
        new Date(validatedData.endDate),
      );

      // Save generated tasks to database
      const savedSchedules = [];
      for (const task of generatedTasks) {
        try {
          const schedule = await ScheduleService.createSchedule(userId, {
            ...task,
            date: new Date(task.date),
            isAIGenerated: true,
          });
          savedSchedules.push(schedule);
        } catch (error) {
          console.error("Error saving task:", error);
          // Continue with other tasks even if one fails
        }
      }

      res.json({
        message: `Generated ${savedSchedules.length} study sessions`,
        schedules: savedSchedules,
      });
    } catch (error: any) {
      console.error("Schedule generation error:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

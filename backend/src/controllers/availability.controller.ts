import { Request, Response } from "express";
import { AvailabilityService } from "../services/availability.service";
import { dailyAvailabilitySchema } from "../validation/schedule.validation";

export class AvailabilityController {
  // Set or update daily availability
  static async setAvailability(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const validatedData = dailyAvailabilitySchema.parse(req.body);

      const availability = await AvailabilityService.setDailyAvailability(
        userId,
        validatedData.dayOfWeek,
        validatedData.timeSlots,
        validatedData.isAvailable ?? true,
      );

      res.json(availability);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get all availability settings
  static async getAllAvailability(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const availability = await AvailabilityService.getAllAvailability(userId);
      res.json(availability);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get availability for a specific day
  static async getDayAvailability(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const dayOfWeek = parseInt(req.params.day);

      if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return res
          .status(400)
          .json({ message: "Invalid day of week (must be 0-6)" });
      }

      const availability = await AvailabilityService.getDayAvailability(
        userId,
        dayOfWeek,
      );

      if (!availability) {
        return res
          .status(404)
          .json({ message: "No availability set for this day" });
      }

      res.json(availability);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete availability for a specific day
  static async deleteAvailability(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const dayOfWeek = parseInt(req.params.day);

      if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return res
          .status(400)
          .json({ message: "Invalid day of week (must be 0-6)" });
      }

      await AvailabilityService.deleteDayAvailability(userId, dayOfWeek);
      res.json({ message: "Availability deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get weekly hours summary
  static async getWeeklyHours(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const hours = await AvailabilityService.calculateWeeklyHours(userId);
      res.json({ weeklyHours: hours });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

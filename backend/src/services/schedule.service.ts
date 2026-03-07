import Schedule, { ISchedule } from "../models/Schedule";
import User from "../models/User";
import Subject from "../models/Subject";
import mongoose from "mongoose";

export class ScheduleService {
  // Create a new scheduled task
  static async createSchedule(
    userId: string,
    scheduleData: Partial<ISchedule>,
  ): Promise<ISchedule> {
    // Validate time range
    if (scheduleData.startTime && scheduleData.endTime) {
      if (scheduleData.startTime >= scheduleData.endTime) {
        throw new Error("End time must be after start time");
      }
    }

    // Check for conflicts
    const hasConflict = await this.checkConflict(
      userId,
      scheduleData.date!,
      scheduleData.startTime!,
      scheduleData.endTime!,
    );

    if (hasConflict) {
      throw new Error("Time slot conflicts with existing schedule");
    }

    const schedule = new Schedule({
      ...scheduleData,
      userId,
    });

    return await schedule.save();
  }

  // Get all schedules for a user with optional filters
  static async getSchedules(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      subjectId?: string;
      completed?: boolean;
    } = {},
  ): Promise<ISchedule[]> {
    const query: any = { userId };

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.subjectId) {
      query.subjectId = filters.subjectId;
    }

    if (filters.completed !== undefined) {
      query.completed = filters.completed;
    }

    return await Schedule.find(query).sort({ date: 1, startTime: 1 });
  }

  // Update a schedule
  static async updateSchedule(
    scheduleId: string,
    userId: string,
    updates: Partial<ISchedule>,
  ): Promise<ISchedule | null> {
    const schedule = await Schedule.findOne({ _id: scheduleId, userId });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // If updating time, check for conflicts
    if (updates.date || updates.startTime || updates.endTime) {
      const date = updates.date || schedule.date;
      const startTime = updates.startTime || schedule.startTime;
      const endTime = updates.endTime || schedule.endTime;

      if (startTime >= endTime) {
        throw new Error("End time must be after start time");
      }

      const hasConflict = await this.checkConflict(
        userId,
        date,
        startTime,
        endTime,
        scheduleId,
      );

      if (hasConflict) {
        throw new Error("Time slot conflicts with existing schedule");
      }
    }

    // If toggling completion, set completedAt
    if (updates.completed !== undefined) {
      if (updates.completed && !schedule.completed) {
        updates.completedAt = new Date();
      } else if (!updates.completed) {
        updates.completedAt = null;
      }
    }

    Object.assign(schedule, updates);
    return await schedule.save();
  }

  // Delete a schedule
  static async deleteSchedule(
    scheduleId: string,
    userId: string,
  ): Promise<void> {
    const result = await Schedule.deleteOne({ _id: scheduleId, userId });

    if (result.deletedCount === 0) {
      throw new Error("Schedule not found");
    }
  }

  // Check for time conflicts
  private static async checkConflict(
    userId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      $or: [
        // New task starts during existing task
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        // New task ends during existing task
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        // New task completely contains existing task
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const conflicts = await Schedule.findOne(query);
    return !!conflicts;
  }

  // Get schedule statistics
  static async getStatistics(userId: string) {
    const user = await User.findById(userId);
    const timezone = user?.timezone || "UTC";
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const now = new Date();
    // Today's boundaries in user's timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const formatToLocalDate = (date: Date) => {
      const parts = formatter.formatToParts(date);
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;
      return `${y}-${m}-${d}`;
    };

    const todayStr = formatToLocalDate(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatToLocalDate(yesterday);

    // Single aggregation for basic counts
    const statsResult = await Schedule.aggregate([
      { $match: { userId: objectUserId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: ["$completed", 1, 0] } },
          upcomingTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $not: ["$completed"] },
                    { $gte: ["$date", new Date(todayStr)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const {
      totalTasks = 0,
      completedTasks = 0,
      upcomingTasks = 0,
    } = statsResult[0] || {};

    // For streak and daily finished, we need completion dates
    const [completedSchedules, subjects] = await Promise.all([
      Schedule.find(
        { userId: objectUserId, completed: true },
        { completedAt: 1, updatedAt: 1 },
      ).lean(),
      Subject.find({ userId: objectUserId }).lean(),
    ]);

    let finishedToday = 0;
    const completedDates = new Set<string>();

    // Process scheduled tasks
    for (const s of completedSchedules) {
      const actualCompletionDate = s.completedAt || s.updatedAt;
      if (actualCompletionDate) {
        const dateStr = formatToLocalDate(new Date(actualCompletionDate));
        completedDates.add(dateStr);
        if (dateStr === todayStr) {
          finishedToday++;
        }
      }
    }

    // Process topic completions from subjects
    let finishedTopicsCount = 0;
    for (const subject of subjects as any[]) {
      for (const chapter of subject.chapters || []) {
        for (const topic of chapter.topics || []) {
          if (topic.finished && topic.finishedAt) {
            finishedTopicsCount++;
            const dateStr = formatToLocalDate(new Date(topic.finishedAt));
            completedDates.add(dateStr);
            if (dateStr === todayStr) {
              finishedToday++;
            }
          }
        }
      }
    }

    // Calculate final task summary counts
    const finalCompletedTasks = completedTasks + finishedTopicsCount;
    const finalTotalTasks = totalTasks + finishedTopicsCount;

    // Calculate Streak using combined pool
    let streak = 0;
    if (completedDates.has(todayStr) || completedDates.has(yesterdayStr)) {
      let checkDate = completedDates.has(todayStr) ? new Date(now) : yesterday;

      while (true) {
        const dateStr = formatToLocalDate(checkDate);
        if (completedDates.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      totalTasks: finalTotalTasks,
      completedTasks: finalCompletedTasks,
      upcomingTasks,
      finishedToday,
      streak,
      completionRate:
        finalTotalTasks > 0 ? (finalCompletedTasks / finalTotalTasks) * 100 : 0,
    };
  }
}

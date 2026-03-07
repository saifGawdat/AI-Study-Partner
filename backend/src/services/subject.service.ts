import Subject from "../models/Subject";
import User from "../models/User";
import { ITopic, IChapter, ISubject } from "../types/subject.types";

export class SubjectService {
  static async getAllSubjects(userId: string) {
    try {
      return await Subject.find({ userId });
    } catch (error) {
      throw error;
    }
  }
  static async getSubjectById(id: string, userId: string) {
    try {
      return await Subject.findOne({ _id: id, userId });
    } catch (error) {
      throw error;
    }
  }
  static async createSubject(subject: ISubject, userId: string) {
    try {
      return await Subject.create({ ...subject, userId });
    } catch (error) {
      throw error;
    }
  }
  static async updateSubject(id: string, subject: ISubject, userId: string) {
    try {
      // Process timestamps before saving
      const processedSubject =
        SubjectService.processFinishedTimestamps(subject);

      return await Subject.findOneAndUpdate(
        { _id: id, userId },
        processedSubject,
        {
          new: true,
        },
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteSubject(id: string, userId: string) {
    try {
      return await Subject.findOneAndDelete({ _id: id, userId });
    } catch (error) {
      throw error;
    }
  }

  static async getDashboardStats(userId: string) {
    try {
      const user = await User.findById(userId);
      const timezone = user?.timezone || "UTC";

      const subjects = await Subject.find({ userId });

      // Pre-instantiate formatter for performance optimization
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      // Optimized helper to format date in user's timezone (YYYY-MM-DD)
      const formatToLocalDate = (date: Date) => {
        const parts = formatter.formatToParts(date);
        const y = parts.find((p) => p.type === "year")?.value;
        const m = parts.find((p) => p.type === "month")?.value;
        const d = parts.find((p) => p.type === "day")?.value;
        return `${y}-${m}-${d}`;
      };

      const now = new Date();
      const todayStr = formatToLocalDate(now);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatToLocalDate(yesterday);

      let finishedToday = 0;
      const finishedDates = new Set<string>();
      const activityMap = new Map<string, number>();

      // Initialize activity map for last 7 days in USER timezone
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = formatToLocalDate(d);
        activityMap.set(dateStr, 0);
      }

      const processItem = (item: any) => {
        if (item.finished && item.finishedAt) {
          const finishedDate = new Date(item.finishedAt);
          const dateStr = formatToLocalDate(finishedDate);

          // Count for today
          if (dateStr === todayStr) {
            finishedToday++;
          }

          // Add to set for streak
          finishedDates.add(dateStr);

          // Add to activity map if within last 7 days keys
          if (activityMap.has(dateStr)) {
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
          }
        }
      };

      for (const subject of subjects) {
        for (const chapter of subject.chapters || []) {
          for (const topic of chapter.topics || []) {
            processItem(topic);
          }
        }
      }

      // Calculate Streak using local dates
      let streak = 0;
      if (finishedDates.has(todayStr) || finishedDates.has(yesterdayStr)) {
        let checkDate = finishedDates.has(todayStr)
          ? new Date(now)
          : new Date(yesterday);

        while (true) {
          const dateStr = formatToLocalDate(checkDate);
          if (finishedDates.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Convert activity map to array
      const activityData = Array.from(activityMap.entries()).map(
        ([date, count]) => ({
          date,
          count,
        }),
      );

      return {
        finishedToday,
        streak,
        totalSubjects: subjects.length,
        activityData,
      };
    } catch (error) {
      throw error;
    }
  }

  private static processFinishedTimestamps(subject: ISubject): ISubject {
    const now = new Date();

    // Process Subject
    if (subject.finished && !subject.finishedAt) {
      subject.finishedAt = now;
    } else if (!subject.finished) {
      subject.finishedAt = null;
    }

    // Process Chapters
    if (subject.chapters) {
      subject.chapters.forEach((chapter) => {
        if (chapter.finished && !chapter.finishedAt) {
          chapter.finishedAt = now;
        } else if (!chapter.finished) {
          chapter.finishedAt = null;
        }

        // Process Topics
        if (chapter.topics) {
          chapter.topics.forEach((topic) => {
            if (topic.finished && !topic.finishedAt) {
              topic.finishedAt = now;
            } else if (!topic.finished) {
              topic.finishedAt = null;
            }
          });
        }
      });
    }

    return subject;
  }
}

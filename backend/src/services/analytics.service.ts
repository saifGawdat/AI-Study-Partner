import mongoose, { Types } from "mongoose";
import Schedule from "../models/Schedule";
import Subject from "../models/Subject";
import User from "../models/User";

type ObjectIdLike = Types.ObjectId | string;

interface TopicLean {
  _id?: ObjectIdLike;
  name?: string;
  finished?: boolean;
  finishedAt?: Date | string | null;
}

interface ChapterLean {
  name?: string;
  topics?: TopicLean[];
}

interface SubjectLean {
  _id: Types.ObjectId;
  name?: string;
  examDate?: Date | string | null;
  chapters?: ChapterLean[];
}

interface ScheduleLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subjectId?: Types.ObjectId | null;
  topicId?: Types.ObjectId | null;
  date?: Date | string | null;
  completed?: boolean;
  completedAt?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
}

interface DailyCompletion {
  date: string;
  rate: number;
  taskCount: number;
}

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  completionRate: number;
  totalMinutes: number;
}

export interface WeeklySubjectCompletion {
  subjectId: string;
  subjectName: string;
  weeks: {
    weekIndex: number;
    completed: number;
    total: number;
    rate: number;
  }[];
}

interface HourlyData {
  hour: number;
  completionRate: number;
  taskCount: number;
}

export interface PredictionResult {
  subjectId: string;
  subjectName: string;
  examDate: string | null;
  currentPace: "on-track" | "at-risk" | "ahead";
  predictedDate: string | null;
  daysUntilDeadline: number | null;
  message: string;
}

interface SubjectRollup {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  completedTopicsLast30: number;
  topicDailyCompletions: Map<string, number>;
  topicWeeklyCompletions: Map<number, number>;
  completedTopicIds: Set<string>;
}

interface SubjectStatAccumulator {
  completed: number;
  total: number;
  minutes: number;
}

function parseTimeToMinutes(time?: string | null): number {
  if (!time || typeof time !== "string") return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getDurationMinutes(
  startTime?: string | null,
  endTime?: string | null,
): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return Math.max(0, end - start);
}

function toObjectId(id: string): Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function normalizeDate(input?: Date | string | null): Date | null {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDateFormatter(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (date: Date) => {
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value ?? "0000";
    const month = parts.find((p) => p.type === "month")?.value ?? "00";
    const day = parts.find((p) => p.type === "day")?.value ?? "00";
    return `${year}-${month}-${day}`;
  };
}

function getHourInTimezone(date: Date, timezone: string): number | null {
  const hour = Number(
    date.toLocaleString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }),
  );

  if (Number.isNaN(hour) || hour < 0 || hour > 23) return null;
  return hour;
}

function getRollingWeekStarts(now: Date, weeks = 4): Date[] {
  const starts: Date[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const d = new Date(now);
    d.setDate(d.getDate() - w * 7);
    d.setHours(0, 0, 0, 0);
    starts.push(d);
  }
  return starts;
}

function createWeekIndexer(weekStarts: Date[]) {
  return (input: Date): number => {
    const date = new Date(input);
    date.setHours(0, 0, 0, 0);

    for (let i = 0; i < weekStarts.length; i++) {
      const start = weekStarts[i];
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      if (date >= start && date < end) return i;
    }

    return -1;
  };
}

function buildInitialSubjectRollup(
  subject: SubjectLean,
  subjectName: string,
): SubjectRollup {
  return {
    subjectId: subject._id.toString(),
    subjectName,
    totalTopics: 0,
    completedTopics: 0,
    completedTopicsLast30: 0,
    topicDailyCompletions: new Map<string, number>(),
    topicWeeklyCompletions: new Map<number, number>(),
    completedTopicIds: new Set<string>(),
  };
}

function addToMapCounter<K>(map: Map<K, number>, key: K, value = 1) {
  map.set(key, (map.get(key) ?? 0) + value);
}

function addSubjectStat(
  map: Map<string, SubjectStatAccumulator>,
  subjectId: string,
  patch: Partial<SubjectStatAccumulator>,
) {
  const current = map.get(subjectId) ?? {
    completed: 0,
    total: 0,
    minutes: 0,
  };

  current.completed += patch.completed ?? 0;
  current.total += patch.total ?? 0;
  current.minutes += patch.minutes ?? 0;

  map.set(subjectId, current);
}

async function getUserTimezone(userId: string): Promise<string> {
  const user = await User.findById(userId)
    .select({ timezone: 1 })
    .lean<{ timezone?: string }>();
  return user?.timezone || "UTC";
}

function extractSubjectsRollup(params: {
  subjects: SubjectLean[];
  thirtyDaysAgo: Date;
  timezone: string;
  getWeekIndex: (date: Date) => number;
}) {
  const { subjects, thirtyDaysAgo, timezone, getWeekIndex } = params;
  const toLocalDate = getDateFormatter(timezone);

  const subjectNameMap = new Map<string, string>();
  const subjectRollups = new Map<string, SubjectRollup>();

  for (const subject of subjects) {
    const subjectId = subject._id.toString();
    const subjectName = subject.name || "Unknown";

    subjectNameMap.set(subjectId, subjectName);

    const rollup = buildInitialSubjectRollup(subject, subjectName);

    for (const chapter of subject.chapters ?? []) {
      for (const topic of chapter.topics ?? []) {
        rollup.totalTopics += 1;

        const topicId = topic._id ? topic._id.toString() : null;
        const finished = Boolean(topic.finished);
        const finishedAt = normalizeDate(topic.finishedAt);

        if (!finished) continue;

        rollup.completedTopics += 1;
        if (topicId) rollup.completedTopicIds.add(topicId);

        if (!finishedAt) continue;

        if (finishedAt >= thirtyDaysAgo) {
          rollup.completedTopicsLast30 += 1;

          const localDate = toLocalDate(finishedAt);
          addToMapCounter(rollup.topicDailyCompletions, localDate, 1);

          const weekIndex = getWeekIndex(finishedAt);
          if (weekIndex >= 0) {
            addToMapCounter(rollup.topicWeeklyCompletions, weekIndex, 1);
          }
        }
      }
    }

    subjectRollups.set(subjectId, rollup);
  }

  return {
    subjectNameMap,
    subjectRollups,
  };
}

export class AnalyticsService {
  /**
   * Monthly analytics for last 30 days:
   * - daily completion
   * - subject performance
   * - weekly subject completion
   *
   * Notes:
   * - Uses Mongoose models with lean queries
   * - Avoids double counting when a schedule is linked to a topicId already counted as finished
   */
  static async getMonthlyAnalytics(
    userId: string,
    startDate?: Date,
  ): Promise<{
    dailyCompletion: DailyCompletion[];
    subjectPerformance: SubjectPerformance[];
    weeklySubjectCompletion: WeeklySubjectCompletion[];
  }> {
    const objectUserId = toObjectId(userId);
    const timezone = await getUserTimezone(userId);
    const toLocalDate = getDateFormatter(timezone);

    const now = new Date();
    const thirtyDaysAgo = startDate ? new Date(startDate) : new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const weekStarts = getRollingWeekStarts(now, 4);
    const getWeekIndex = createWeekIndexer(weekStarts);

    const [dailyScheduleAgg, schedules, subjects] = await Promise.all([
      Schedule.aggregate<{
        _id: string;
        total: number;
        completed: number;
      }>([
        {
          $match: {
            userId: objectUserId,
            date: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
                timezone,
              },
            },
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$completed", true] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Schedule.find(
        {
          userId: objectUserId,
          date: { $gte: thirtyDaysAgo },
          subjectId: { $ne: null },
        },
        {
          subjectId: 1,
          topicId: 1,
          completed: 1,
          startTime: 1,
          endTime: 1,
          date: 1,
        },
      ).lean<ScheduleLean[]>(),
      Subject.find(
        { userId: objectUserId },
        {
          name: 1,
          examDate: 1,
          chapters: 1,
        },
      ).lean<SubjectLean[]>(),
    ]);

    const { subjectNameMap, subjectRollups } = extractSubjectsRollup({
      subjects,
      thirtyDaysAgo,
      timezone,
      getWeekIndex,
    });

    const dailyMap = new Map<string, { completed: number; total: number }>();

    for (const row of dailyScheduleAgg) {
      dailyMap.set(row._id, {
        completed: row.completed,
        total: row.total,
      });
    }

    for (const rollup of subjectRollups.values()) {
      for (const [date, completedCount] of rollup.topicDailyCompletions) {
        const entry = dailyMap.get(date) ?? { completed: 0, total: 0 };
        entry.completed += completedCount;
        entry.total += completedCount;
        dailyMap.set(date, entry);
      }
    }

    const subjectStats = new Map<string, SubjectStatAccumulator>();
    const weeklyBySubject = new Map<
      string,
      Map<number, { completed: number; total: number }>
    >();

    const getSubjectWeekBucket = (subjectId: string, weekIndex: number) => {
      let subjectWeeks = weeklyBySubject.get(subjectId);
      if (!subjectWeeks) {
        subjectWeeks = new Map();
        weeklyBySubject.set(subjectId, subjectWeeks);
      }

      const bucket = subjectWeeks.get(weekIndex) ?? { completed: 0, total: 0 };
      subjectWeeks.set(weekIndex, bucket);
      return bucket;
    };

    for (const schedule of schedules) {
      const subjectId = schedule.subjectId?.toString();
      if (!subjectId) continue;

      const linkedTopicId = schedule.topicId?.toString() ?? null;
      const rollup = subjectRollups.get(subjectId);

      const scheduleDate = normalizeDate(schedule.date);
      const minutes = getDurationMinutes(schedule.startTime, schedule.endTime);
      const isCompleted = Boolean(schedule.completed);

      const isDuplicateTopicCompletion =
        Boolean(linkedTopicId) &&
        Boolean(rollup?.completedTopicIds.has(linkedTopicId ?? ""));

      // Keep duration regardless, because studying time is still real even if linked to a topic.
      addSubjectStat(subjectStats, subjectId, { minutes });

      // Avoid double counting total/completed units if the schedule is directly linked
      // to a topic completion that is already counted from Subject.chapters.topics.
      if (!isDuplicateTopicCompletion) {
        addSubjectStat(subjectStats, subjectId, {
          total: 1,
          completed: isCompleted ? 1 : 0,
        });

        if (scheduleDate) {
          const weekIndex = getWeekIndex(scheduleDate);
          if (weekIndex >= 0) {
            const bucket = getSubjectWeekBucket(subjectId, weekIndex);
            bucket.total += 1;
            if (isCompleted) bucket.completed += 1;
          }
        }
      }
    }

    for (const rollup of subjectRollups.values()) {
      addSubjectStat(subjectStats, rollup.subjectId, {
        total: rollup.totalTopics,
        completed: rollup.completedTopics,
      });

      for (const [weekIndex, completedCount] of rollup.topicWeeklyCompletions) {
        const bucket = getSubjectWeekBucket(rollup.subjectId, weekIndex);
        bucket.total += completedCount;
        bucket.completed += completedCount;
      }
    }

    const dailyCompletion: DailyCompletion[] = [];
    const cursor = new Date(thirtyDaysAgo);

    while (cursor <= now) {
      const date = toLocalDate(cursor);
      const entry = dailyMap.get(date);
      const total = entry?.total ?? 0;
      const completed = entry?.completed ?? 0;

      dailyCompletion.push({
        date,
        rate: total > 0 ? (completed / total) * 100 : 0,
        taskCount: total,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    const allSubjectIds = new Set<string>([
      ...subjectNameMap.keys(),
      ...subjectStats.keys(),
      ...weeklyBySubject.keys(),
    ]);

    const subjectPerformance: SubjectPerformance[] = [...allSubjectIds].map(
      (subjectId) => {
        const stats = subjectStats.get(subjectId) ?? {
          completed: 0,
          total: 0,
          minutes: 0,
        };

        return {
          subjectId,
          subjectName: subjectNameMap.get(subjectId) || "Unknown",
          completionRate:
            stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
          totalMinutes: stats.minutes,
        };
      },
    );

    const weeklySubjectCompletion: WeeklySubjectCompletion[] = [
      ...allSubjectIds,
    ].map((subjectId) => {
      const subjectWeeks = weeklyBySubject.get(subjectId);

      const weeks = Array.from({ length: 4 }, (_, weekIndex) => {
        const bucket = subjectWeeks?.get(weekIndex) ?? {
          completed: 0,
          total: 0,
        };
        return {
          weekIndex,
          completed: bucket.completed,
          total: bucket.total,
          rate: bucket.total > 0 ? (bucket.completed / bucket.total) * 100 : 0,
        };
      });

      return {
        subjectId,
        subjectName: subjectNameMap.get(subjectId) || "Unknown",
        weeks,
      };
    });

    return {
      dailyCompletion,
      subjectPerformance,
      weeklySubjectCompletion,
    };
  }

  /**
   * Productivity by hour based on:
   * - Schedule.completedAt
   * - Topic.finishedAt
   */
  static async getProductivityByHour(userId: string): Promise<HourlyData[]> {
    const objectUserId = toObjectId(userId);
    const timezone = await getUserTimezone(userId);

    const hourMap = new Map<number, number>();

    const [scheduleHourAgg, subjects] = await Promise.all([
      Schedule.aggregate<{ _id: number; count: number }>([
        {
          $match: {
            userId: objectUserId,
            completed: true,
            completedAt: { $ne: null },
          },
        },
        {
          $group: {
            _id: {
              $hour: {
                date: "$completedAt",
                timezone,
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Subject.find({ userId: objectUserId }, { chapters: 1 }).lean<
        SubjectLean[]
      >(),
    ]);

    for (const row of scheduleHourAgg) {
      if (row._id >= 0 && row._id <= 23) {
        hourMap.set(row._id, (hourMap.get(row._id) ?? 0) + row.count);
      }
    }

    for (const subject of subjects) {
      for (const chapter of subject.chapters ?? []) {
        for (const topic of chapter.topics ?? []) {
          if (!topic.finished || !topic.finishedAt) continue;

          const date = normalizeDate(topic.finishedAt);
          if (!date) continue;

          const hour = getHourInTimezone(date, timezone);
          if (hour === null) continue;

          hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
        }
      }
    }

    const totalCompleted = [...hourMap.values()].reduce(
      (sum, value) => sum + value,
      0,
    );

    return Array.from({ length: 24 }, (_, hour) => {
      const taskCount = hourMap.get(hour) ?? 0;
      return {
        hour,
        taskCount,
        completionRate:
          totalCompleted > 0 ? (taskCount / totalCompleted) * 100 : 0,
      };
    });
  }

  /**
   * Prediction for a single subject.
   * Uses topics as primary workload source.
   * Falls back to schedules when no topics exist.
   */
  static async getPredictedCompletionDate(
    userId: string,
    subjectId: string,
  ): Promise<PredictionResult | null> {
    const objectUserId = toObjectId(userId);
    const objectSubjectId = toObjectId(subjectId);

    const [subject, fallbackScheduleAgg] = await Promise.all([
      Subject.findOne(
        { _id: objectSubjectId, userId: objectUserId },
        { name: 1, examDate: 1, chapters: 1 },
      ).lean<SubjectLean | null>(),
      Schedule.aggregate<{
        _id: null;
        total: number;
        completed: number;
        completedLast30: number;
      }>([
        {
          $match: {
            userId: objectUserId,
            subjectId: objectSubjectId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$completed", true] }, 1, 0],
              },
            },
            completedLast30: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$completed", true] },
                      {
                        $gte: [
                          "$date",
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    if (!subject) return null;

    const subName = subject.name || "Unknown";
    const examDate = normalizeDate(subject.examDate);

    let totalWorkload = 0;
    let completedWorkload = 0;
    let completedUnitsLast30 = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const chapter of subject.chapters ?? []) {
      for (const topic of chapter.topics ?? []) {
        totalWorkload += 1;

        if (!topic.finished) continue;
        completedWorkload += 1;

        const finishedAt = normalizeDate(topic.finishedAt);
        if (finishedAt && finishedAt >= thirtyDaysAgo) {
          completedUnitsLast30 += 1;
        }
      }
    }

    // Fallback to schedules when there are no topics at all
    if (totalWorkload === 0) {
      const scheduleStats = fallbackScheduleAgg[0];
      totalWorkload = scheduleStats?.total ?? 0;
      completedWorkload = scheduleStats?.completed ?? 0;
      completedUnitsLast30 = scheduleStats?.completedLast30 ?? 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (completedWorkload >= totalWorkload && totalWorkload > 0) {
      return {
        subjectId,
        subjectName: subName,
        examDate: examDate ? formatDateOnly(examDate) : null,
        currentPace: "ahead",
        predictedDate: null,
        daysUntilDeadline: examDate
          ? Math.ceil((examDate.getTime() - today.getTime()) / 86400000)
          : null,
        message: "Completed! All topics finished.",
      };
    }

    if (examDate && examDate < today) {
      return {
        subjectId,
        subjectName: subName,
        examDate: formatDateOnly(examDate),
        currentPace: "on-track",
        predictedDate: null,
        daysUntilDeadline: null,
        message: "Exam already passed.",
      };
    }

    const avgPerDay = completedUnitsLast30 / 30;
    const remaining = Math.max(0, totalWorkload - completedWorkload);

    let predictedDate: Date | null = null;
    if (avgPerDay > 0 && remaining > 0) {
      const daysToComplete = Math.ceil(remaining / avgPerDay);
      predictedDate = new Date(today);
      predictedDate.setDate(predictedDate.getDate() + daysToComplete);
    }

    const daysUntilDeadline = examDate
      ? Math.ceil((examDate.getTime() - today.getTime()) / 86400000)
      : null;

    let currentPace: "on-track" | "at-risk" | "ahead" = "on-track";
    let message = "";

    if (!examDate) {
      currentPace = predictedDate ? "on-track" : "at-risk";
      message = predictedDate
        ? `At current pace, you'll finish by ${formatDateOnly(predictedDate)}`
        : "Not enough recent completion data to predict.";
    } else if (!predictedDate) {
      currentPace = "at-risk";
      message = `At risk - not enough data to predict. Exam in ${daysUntilDeadline ?? 0} days.`;
    } else {
      const predictedDaysFromToday = Math.ceil(
        (predictedDate.getTime() - today.getTime()) / 86400000,
      );
      const deadlineDays = daysUntilDeadline ?? 0;

      if (predictedDaysFromToday <= deadlineDays) {
        const daysEarly = deadlineDays - predictedDaysFromToday;
        currentPace = "ahead";
        message = `At current pace, you'll finish by ${formatDateOnly(predictedDate)} (${daysEarly} day${daysEarly === 1 ? "" : "s"} early) ✓`;
      } else {
        currentPace = "at-risk";
        message = `At risk - exam in ${deadlineDays} days, predicted finish: ${formatDateOnly(predictedDate)}`;
      }
    }

    return {
      subjectId,
      subjectName: subName,
      examDate: examDate ? formatDateOnly(examDate) : null,
      currentPace,
      predictedDate: predictedDate ? formatDateOnly(predictedDate) : null,
      daysUntilDeadline,
      message,
    };
  }

  /**
   * Prediction for all subjects in parallel.
   */
  static async getAllPredictions(userId: string): Promise<PredictionResult[]> {
    const objectUserId = toObjectId(userId);

    const subjects = await Subject.find(
      { userId: objectUserId },
      { _id: 1 },
    ).lean<{ _id: Types.ObjectId }[]>();

    const results = await Promise.all(
      subjects.map((subject) =>
        this.getPredictedCompletionDate(userId, subject._id.toString()),
      ),
    );

    return results.filter((item): item is PredictionResult => item !== null);
  }
}

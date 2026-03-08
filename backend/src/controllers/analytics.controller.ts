import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {
  /**
   * GET /api/analytics/summary
   * Returns monthly, hourly, and prediction analytics.
   */
  static async getSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const [monthly, hourly, predictions] = await Promise.all([
        AnalyticsService.getMonthlyAnalytics(userId),
        AnalyticsService.getProductivityByHour(userId),
        AnalyticsService.getAllPredictions(userId),
      ]);

      res.json({
        monthly,
        hourly,
        predictions,
      });
    } catch (error) {
      console.error("Analytics summary error:", error);
      res.status(500).json({
        message: "Failed to fetch analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

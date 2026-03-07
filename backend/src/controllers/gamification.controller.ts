import { Request, Response } from "express";
import { GamificationService } from "../services/gamification.service";

export class GamificationController {
  static async getMilestones(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = await GamificationService.getMilestones(userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

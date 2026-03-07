import { Router } from "express";
import { GamificationController } from "../controllers/gamification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/milestones", authMiddleware, GamificationController.getMilestones);

export default router;

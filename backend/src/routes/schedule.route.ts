import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Schedule CRUD
router.post("/", ScheduleController.createSchedule);
router.get("/", ScheduleController.getSchedules);
router.put("/:id", ScheduleController.updateSchedule);
router.delete("/:id", ScheduleController.deleteSchedule);

// Statistics
router.get("/stats", ScheduleController.getStatistics);

// AI schedule generation
router.post("/generate", ScheduleController.generateSchedule);

export default router;

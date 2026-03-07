import { Router } from "express";
import { AvailabilityController } from "../controllers/availability.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Availability CRUD
router.post("/", AvailabilityController.setAvailability);
router.get("/", AvailabilityController.getAllAvailability);
router.get("/:day", AvailabilityController.getDayAvailability);
router.delete("/:day", AvailabilityController.deleteAvailability);

// Weekly hours summary
router.get("/stats/weekly-hours", AvailabilityController.getWeeklyHours);

export default router;

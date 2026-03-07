import { Router } from "express";
import { SubjectController } from "../controllers/subject.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", SubjectController.getAllSubjects);
router.get("/stats", SubjectController.getStats);
router.get("/:id", SubjectController.getSubjectById);
router.post("/", SubjectController.createSubject);
router.put("/:id", SubjectController.updateSubject);
router.delete("/:id", SubjectController.deleteSubject);

export default router;

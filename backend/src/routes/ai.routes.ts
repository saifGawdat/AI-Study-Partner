import { Router } from "express";
import multer from "multer";
import { AIController } from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Configure multer for in-memory storage (files NOT saved to disk)
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory only
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

router.post(
  "/extract-book",
  authMiddleware,
  upload.single("file"),
  AIController.extractBook,
);

export default router;

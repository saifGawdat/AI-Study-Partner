import { Request, Response } from "express";
import { AIService } from "../services/ai.service";

export class AIController {
  static async extractBook(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const allowedMimeTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Please upload PDF or image files.",
        });
      }

      // Process file in-memory (buffer is already in req.file.buffer from multer)
      // File is NOT stored anywhere - only processed and discarded
      const extracted = await AIService.extractBookStructure(
        req.file.buffer,
        req.file.mimetype,
      );

      // Return extracted structure only
      res.json(extracted);
    } catch (error: any) {
      console.error("Extract book error:", error);
      res.status(500).json({
        message: error.message || "Failed to extract book structure",
      });
    }
  }
}

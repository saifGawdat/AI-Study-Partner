import { Request, Response } from "express";
import { ZodError } from "zod";
import { SubjectService } from "../services/subject.service";
import { validateSubjectResourceLinks } from "../validation/subject.validation";

export class SubjectController {
  static async getAllSubjects(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const subjects = await SubjectService.getAllSubjects(userId);
      res.status(200).json(subjects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await SubjectService.getDashboardStats(userId);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getSubjectById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const subject = await SubjectService.getSubjectById(
        req.params.id,
        userId,
      );
      if (!subject) {
        res.status(404).json({ message: "Subject not found" });
        return;
      }
      res.status(200).json(subject);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createSubject(req: Request, res: Response) {
    try {
      validateSubjectResourceLinks(req.body);
      const userId = req.user!.userId;
      const subject = await SubjectService.createSubject(req.body, userId);
      res.status(201).json(subject);
    } catch (error: any) {
      const status = error instanceof ZodError ? 400 : 500;
      const message =
        error instanceof ZodError
          ? error.issues.map((i) => i.message).join("; ") || "Validation failed"
          : error.message;
      res.status(status).json({ message });
    }
  }

  static async updateSubject(req: Request, res: Response) {
    try {
      validateSubjectResourceLinks(req.body);
      const userId = req.user!.userId;
      const subject = await SubjectService.updateSubject(
        req.params.id,
        req.body,
        userId,
      );
      if (!subject) {
        res.status(404).json({ message: "Subject not found" });
        return;
      }
      res.status(200).json(subject);
    } catch (error: any) {
      const status = error instanceof ZodError ? 400 : 500;
      const message =
        error instanceof ZodError
          ? error.issues.map((i) => i.message).join("; ") || "Validation failed"
          : error.message;
      res.status(status).json({ message });
    }
  }

  static async deleteSubject(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const subject = await SubjectService.deleteSubject(req.params.id, userId);
      if (!subject) {
        res.status(404).json({ message: "Subject not found" });
        return;
      }
      res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

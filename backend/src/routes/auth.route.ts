import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

import { authMiddleware } from "../middleware/auth.middleware";

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/google", AuthController.google);
router.post("/refresh", AuthController.refresh);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/me", authMiddleware, AuthController.me);
router.delete("/", authMiddleware, AuthController.deleteAccount);

export default router;

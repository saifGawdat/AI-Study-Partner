import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { signupSchema, loginSchema, googleAuthSchema } from "../validation/auth";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const validatedData = signupSchema.parse(req.body);
      const { accessToken, refreshToken, user } =
        await AuthService.signup(validatedData);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({ user });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } =
        await AuthService.login(validatedData);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(401).json({ message: error.message });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getMe(userId);
      res.json(user);
    } catch (error: any) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) throw new Error("No refresh token");

      const { accessToken, refreshToken } =
        await AuthService.refreshAccessToken(token);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  static async google(req: Request, res: Response) {
    try {
      const { credential } = googleAuthSchema.parse(req.body);
      const timezone = (req.body.timezone as string) || "UTC";
      const { accessToken, refreshToken, user } =
        await AuthService.googleLogin(credential, timezone);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ user });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(401).json({ message: error.message || "Google sign-in failed" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await AuthService.logout(userId);
      }
      res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Logout failed" });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await AuthService.deleteAccount(userId);

      // Clear cookies after account deletion
      res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

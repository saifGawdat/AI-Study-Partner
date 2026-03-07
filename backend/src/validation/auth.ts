import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  timezone: z.string().optional(),
  availability: z
    .object({
      weekdayMinutes: z.number().default(120),
      weekendMinutes: z.number().default(240),
    })
    .default({}),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  timezone: z.string().optional(),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});

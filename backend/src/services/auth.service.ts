import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User, { IUser } from "../models/User";
import Subject from "../models/Subject";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  static async signup(data: any) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = new User({
      email: data.email,
      passwordHash: data.password,
      timezone: data.timezone || "UTC",
      availability: data.availability,
    });

    await user.save();
    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        availability: user.availability,
        timezone: user.timezone,
      },
    };
  }

  static async login(data: any) {
    const user = await User.findOne({ email: data.email });
    if (!user || !(await user.comparePassword(data.password))) {
      throw new Error("Invalid credentials");
    }

    // Update timezone if provided and different
    if (data.timezone && user.timezone !== data.timezone) {
      user.timezone = data.timezone;
      await user.save();
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        availability: user.availability,
        timezone: user.timezone,
      },
    };
  }

  static async googleLogin(credential: string, timezone?: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new Error("Invalid Google token: missing email");
    }
    const { sub: googleId, email } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = new User({
          email,
          googleId,
          timezone: timezone || "UTC",
        });
        await user.save();
      }
    }

    if (timezone && user.timezone !== timezone) {
      user.timezone = timezone;
      await user.save();
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        availability: user.availability,
        timezone: user.timezone,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async refreshAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
      };

      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== token) {
        throw new Error("Invalid refresh token");
      }

      const tokens = this.generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
  }

  static async deleteAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Cascading deletion: Delete all subjects created by this user
    await Subject.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return { message: "Account deleted successfully" };
  }

  private static generateTokens(user: IUser) {
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    return { accessToken, refreshToken };
  }
}

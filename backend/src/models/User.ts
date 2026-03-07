import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  timezone: string;
  availability: {
    weekdayMinutes: number;
    weekendMinutes: number;
  };
  refreshToken?: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, required: false, sparse: true, unique: true },
    timezone: { type: String, default: "UTC" },
    availability: {
      weekdayMinutes: { type: Number, default: 120 },
      weekendMinutes: { type: Number, default: 240 },
    },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

// Hash password before saving (only when password is set)
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser>("User", UserSchema);

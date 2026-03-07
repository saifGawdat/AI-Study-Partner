import mongoose, { Schema, Document } from "mongoose";

export interface ITimeSlot {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface IDailyAvailability extends Document {
  userId: mongoose.Types.ObjectId;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlots: ITimeSlot[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
  },
  { _id: false },
);

const DailyAvailabilitySchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    timeSlots: {
      type: [TimeSlotSchema],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Ensure one document per user per day
DailyAvailabilitySchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model<IDailyAvailability>(
  "DailyAvailability",
  DailyAvailabilitySchema,
);

import mongoose, { Schema, Document } from "mongoose";

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  subjectId?: mongoose.Types.ObjectId;
  chapterId?: string;
  topicId?: string;
  isAIGenerated: boolean;
  completed: boolean;
  completedAt?: Date | null;
  difficulty?: string; // easy, medium, hard
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    chapterId: {
      type: String,
      default: null,
    },
    topicId: {
      type: String,
      default: null,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true },
);

// Index for efficient querying
ScheduleSchema.index({ userId: 1, date: 1 });
ScheduleSchema.index({ userId: 1, completed: 1 });
ScheduleSchema.index({ userId: 1, completedAt: 1 });

export default mongoose.model<ISchedule>("Schedule", ScheduleSchema);

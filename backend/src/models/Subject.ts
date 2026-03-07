import mongoose from "mongoose";

const resourceLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, maxlength: 80 },
    url: { type: String, required: true },
  },
  { _id: false },
);

const subjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  resourceLinks: {
    type: [resourceLinkSchema],
    default: [],
    validate: {
      validator: (v: unknown[]) => Array.isArray(v) && v.length <= 20,
      message: "resourceLinks must have at most 20 items",
    },
  },
  chapters: [
    {
      name: String,
      description: String,
      topics: [
        {
          name: String,
          description: String,
          resourceLinks: {
            type: [resourceLinkSchema],
            default: [],
            validate: {
              validator: (v: unknown[]) => Array.isArray(v) && v.length <= 20,
              message: "resourceLinks must have at most 20 items",
            },
          },
          finished: {
            type: Boolean,
            default: false,
          },
          finishedAt: {
            type: Date,
            default: null,
          },
        },
      ],
      finished: {
        type: Boolean,
        default: false,
      },
      finishedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  finished: {
    type: Boolean,
    default: false,
  },
  finishedAt: {
    type: Date,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  examDate: {
    type: Date,
    default: null,
  },
});

export default mongoose.model("Subject", subjectSchema);

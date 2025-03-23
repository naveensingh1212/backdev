import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      index: true, // Faster queries
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    externalVideoId: {
      type: String,
      trim: true, // Prevents unwanted spaces
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensures every like has a user
      index: true, // Optimized querying
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      index: true, // Indexing for faster lookups
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true, // Indexing for faster user-based queries
    },
    externalVideoId: {
      type: String,
      trim: true, // Prevent accidental spaces
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination support
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);

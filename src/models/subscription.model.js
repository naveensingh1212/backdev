import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // The user who is subscribing
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId, // The user being subscribed to
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // Corrected timestamps option
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

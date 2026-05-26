// models/JoinRequest.js

import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    requestedRole: {
      type: String,
      enum: [
        "editor",
        "packer",
        "dispatcher",
        "support",
        "viewer",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    message: {
      type: String,
      maxlength: 300,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("JoinRequest", joinRequestSchema);
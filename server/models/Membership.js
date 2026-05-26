// models/Membership.js

import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────
    // RELATIONS
    // ─────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // ─────────────────────────────────────
    // ROLE SYSTEM
    // ─────────────────────────────────────
    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "manager",
        "editor",
        "packer",
        "dispatcher",
        "support",
        "viewer",
      ],
      required: true,
    },

    // ─────────────────────────────────────
    // MEMBERSHIP STATUS
    // ─────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    // ─────────────────────────────────────
    // APPROVAL INFO
    // ─────────────────────────────────────
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    rejectedAt: Date,

    rejectionReason: String,

    // ─────────────────────────────────────
    // USER PERMISSIONS
    // ─────────────────────────────────────
    permissions: {
      canManageUsers: {
        type: Boolean,
        default: false,
      },

      canManageOrders: {
        type: Boolean,
        default: false,
      },

      canAssignCouriers: {
        type: Boolean,
        default: false,
      },

      canViewAnalytics: {
        type: Boolean,
        default: false,
      },

      canManageSettings: {
        type: Boolean,
        default: false,
      },

      canDeleteOrders: {
        type: Boolean,
        default: false,
      },
    },

    // ─────────────────────────────────────
    // ACTIVITY
    // ─────────────────────────────────────
    lastActiveAt: Date,

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index(
  { userId: 1, storeId: 1 },
  { unique: true }
);

export default mongoose.model("Membership", membershipSchema);
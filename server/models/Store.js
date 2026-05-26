// models/Store.js

import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────
    // BASIC STORE INFO
    // ─────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      maxlength: 500,
    },

    logo: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    // ─────────────────────────────────────
    // STORE ACCESS
    // ─────────────────────────────────────
    storeKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ─────────────────────────────────────
    // STORE STATUS
    // ─────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: {
      type: String,
      default: "",
    },

    // ─────────────────────────────────────
    // BUSINESS SETTINGS
    // ─────────────────────────────────────
    currency: {
      type: String,
      default: "PKR",
    },

    timezone: {
      type: String,
      default: "Asia/Karachi",
    },

    language: {
      type: String,
      default: "en",
    },

    // ─────────────────────────────────────
    // OPERATION SETTINGS
    // ─────────────────────────────────────
    settings: {
      autoAssignOrders: {
        type: Boolean,
        default: false,
      },

      allowCOD: {
        type: Boolean,
        default: true,
      },

      requirePackingVerification: {
        type: Boolean,
        default: false,
      },

      enableFraudDetection: {
        type: Boolean,
        default: true,
      },

      allowMultipleCouriers: {
        type: Boolean,
        default: true,
      },

      defaultCourier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courier",
      },
    },

    // ─────────────────────────────────────
    // COURIER CONFIGURATION
    // ─────────────────────────────────────
    couriers: [
      {
        courierId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Courier",
        },

        isEnabled: {
          type: Boolean,
          default: true,
        },

        apiConnected: {
          type: Boolean,
          default: false,
        },

        priority: {
          type: Number,
          default: 0,
        },

        credentialsConfigured: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ─────────────────────────────────────
    // SUBSCRIPTION / BILLING
    // ─────────────────────────────────────
    subscription: {
      plan: {
        type: String,
        enum: ["free", "starter", "growth", "enterprise"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["active", "trial", "expired", "cancelled"],
        default: "trial",
      },

      startsAt: Date,

      expiresAt: Date,

      maxUsers: {
        type: Number,
        default: 5,
      },

      maxOrdersPerMonth: {
        type: Number,
        default: 100,
      },
    },

    // ─────────────────────────────────────
    // ANALYTICS / METRICS SNAPSHOT
    // ─────────────────────────────────────
    metrics: {
      totalOrders: {
        type: Number,
        default: 0,
      },

      deliveredOrders: {
        type: Number,
        default: 0,
      },

      cancelledOrders: {
        type: Number,
        default: 0,
      },

      returnedOrders: {
        type: Number,
        default: 0,
      },

      activeShipments: {
        type: Number,
        default: 0,
      },

      codSuccessRate: {
        type: Number,
        default: 0,
      },

      totalRevenue: {
        type: Number,
        default: 0,
      },

      totalUsers: {
        type: Number,
        default: 1,
      },
    },

    // ─────────────────────────────────────
    // SECURITY
    // ─────────────────────────────────────
    security: {
      lastStoreKeyRotation: Date,

      lastLoginAt: Date,

      suspiciousActivityCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Store", storeSchema);
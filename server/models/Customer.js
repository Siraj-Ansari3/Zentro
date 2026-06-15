import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────
    // RELATION
    // ─────────────────────────────────────
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // ─────────────────────────────────────
    // BASIC INFO
    // ─────────────────────────────────────
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    city: String,
    area: String,

    address: String,

    // ─────────────────────────────────────
    // CUSTOMER STATUS
    // ─────────────────────────────────────
    isBlacklisted: {
      type: Boolean,
      default: false,
    },

    blacklistReason: {
      type: String,
      default: "",
    },

    isCODBlocked: {
      type: Boolean,
      default: false,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    fraudScore: {
      type: Number,
      default: 0,
    },

    riskScore: {
      type: Number,
      default: 0,
    },

    // ─────────────────────────────────────
    // CUSTOMER ANALYTICS
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

      totalSpent: {
        type: Number,
        default: 0,
      },

      codSuccessRate: {
        type: Number,
        default: 0,
      },

      averageOrderValue: {
        type: Number,
        default: 0,
      },
    },

    // ─────────────────────────────────────
    // COMMUNICATION
    // ─────────────────────────────────────
    communication: {
      whatsappOptIn: {
        type: Boolean,
        default: true,
      },

      lastMessageAt: Date,

      lastOrderAt: Date,

      notes: [
        {
          text: String,

          createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // ─────────────────────────────────────
    // TAGS
    // ─────────────────────────────────────
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

customerSchema.index({
  storeId: 1,
  phone: 1,
});

customerSchema.index({
  storeId: 1,
  riskLevel: 1,
});

export default mongoose.model("Customer", customerSchema);
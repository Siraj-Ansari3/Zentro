import mongoose from "mongoose";

const storeCourierIntegrationSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────
    // RELATIONS
    // ─────────────────────────────────────
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      required: true,
      index: true,
    },

    pickupAddressCode: {
      type: String,
      default: "",
    },

    // ─────────────────────────────────────
    // CONNECTION STATUS
    // ─────────────────────────────────────
    active: {
      type: Boolean,
      default: true,
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // ─────────────────────────────────────
    // CREDENTIALS
    // ─────────────────────────────────────
    credentials: {
      apiKey: {
        type: String,
        required: true,
      },

      apiSecret: {
        type: String,
        default: "",
      },

      accountNumber: {
        type: String,
        default: "",
      },

      merchantId: {
        type: String,
        default: "",
      },
    },

    // ─────────────────────────────────────
    // SETTINGS
    // ─────────────────────────────────────
    settings: {
      autoSyncTracking: {
        type: Boolean,
        default: true,
      },

      autoFulfillShopify: {
        type: Boolean,
        default: true,
      },

      autoAssign: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// One courier connection per store
storeCourierIntegrationSchema.index(
  {
    storeId: 1,
    courierId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "StoreCourierIntegration",
  storeCourierIntegrationSchema
);
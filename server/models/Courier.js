// models/Courier.js

import mongoose from "mongoose";

const courierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    logo: String,

    trackingUrl: String,

    apiSupported: {
      type: Boolean,
      default: false,
    },

    supportsCOD: {
      type: Boolean,
      default: true,
    },

    supportsBulkBooking: {
      type: Boolean,
      default: false,
    },

    estimatedDeliveryDays: {
      min: Number,
      max: Number,
    },

    performanceMetrics: {
      avgDeliveryRate: Number,
      avgReturnRate: Number,
      avgDelayRate: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Courier", courierSchema);
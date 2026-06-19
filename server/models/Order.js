// models/Order.js

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
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

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      //   required: true,
      index: true,
    },

    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courier",
      default: null,
      index: true,
    },

    // courier: {
    //   type: String,
    //   default: "",
    // },

    trackingNumber: {
      type: String,
      default: "",
      index: true,
    },

    trackingUrl: {
      type: String,
      default: ""
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedAt: Date,

    // ─────────────────────────────────────
    // ORDER IDENTITY
    // ─────────────────────────────────────
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    externalOrderId: {
      type: String,
      default: "",
      index: true,
    },

    source: {
      type: String,
      enum: [
        "manual",
        "shopify",
        "woocommerce",
        "daraz",
        "whatsapp",
        "api",
      ],
      default: "manual",
    },

    courierResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ─────────────────────────────────────
    // ORDER STATUS
    // ─────────────────────────────────────
    status: {
      type: String,
      enum: [
        "new",
        "verified",
        "assigned",
        "shipped",
        "in_transit",
        "delivered",
        "failed_delivery",
        "returned",
        "cancelled"
      ],
      default: "new",
      index: true,
    },

    // ─────────────────────────────────────
    // PAYMENT
    // ─────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["COD", "prepaid", "bank_transfer"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // ─────────────────────────────────────
    // PRICING
    // ─────────────────────────────────────
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    currency: {
      type: String,
      default: "PKR",
    },

    // ─────────────────────────────────────
    // PRODUCTS
    // ─────────────────────────────────────
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },

        name: {
          type: String,
          required: true,
        },

        sku: {
          type: String,
          default: "",
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        unitPrice: {
          type: Number,
          required: true,
        },

        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],

    // ───────────────────────────────────
    // SHIPPING INFO
    // ───────────────────────────────────
    shippingAddress: {
      fullName: String,
      phone: String,

      city: String,
      area: String,

      address: String,

      postalCode: String,
    },

    // ─────────────────────────────────────
    // OPERATIONS
    // ─────────────────────────────────────
    packingStatus: {
      type: String,
      enum: ["pending", "in_progress", "packed"],
      default: "pending",
    },

    verificationStatus: {
      type: String,
      enum: [
        "not_required",
        "pending",
        "verified",
        "rejected"
      ],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // ─────────────────────────────────────
    // DELIVERY OUTCOME
    // ─────────────────────────────────────
    deliveryAttempts: {
      type: Number,
      default: 0,
    },

    deliveredAt: Date,
    shippedAt: Date,

    failedReason: {
      type: String,
      default: "",
    },

    returnReason: {
      type: String,
      default: "",
    },

    // ─────────────────────────────────────
    // FRAUD / RISK
    // ─────────────────────────────────────
    fraudScore: {
      type: Number,
      default: 0,
    },

    // riskLevel: {
    //   type: String,
    //   enum: ["low", "medium", "high"],
    //   default: "low",
    // },

    flaggedReasons: [
      {
        type: String,
      },
    ],

    // ─────────────────────────────────────
    // COMMUNICATION
    // ─────────────────────────────────────
    lastCustomerMessageAt: Date,

    customerResponded: {
      type: Boolean,
      default: false,
    },

    // ─────────────────────────────────────
    // NOTES
    // ─────────────────────────────────────
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

    // ─────────────────────────────────────
    // TIMELINE
    // ─────────────────────────────────────
    timeline: [
      {
        type: {
          type: String,
        },

        message: String,

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
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────
// INDEXES
// ─────────────────────────────────────

orderSchema.index({
  storeId: 1,
  status: 1,
});

orderSchema.index({
  storeId: 1,
  customerId: 1,
});

orderSchema.index({
  storeId: 1,
  createdAt: -1,
});

orderSchema.index({
  trackingNumber: 1,
});

export default mongoose.model("Order", orderSchema);
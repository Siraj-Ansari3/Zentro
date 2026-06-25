import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema({

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    type: {
        type: String,
        enum: [
            "RETURN",
            "EXCHANGE",
            "REFUND",
            "CANCELLED_AFTER_CONFIRMATION",
            "DAMAGED_ITEM",
            "WRONG_ITEM",
            "MISSING_ITEM"
        ],
        required: true
    },

    status: {
        type: String,
        enum: [
            "REQUESTED",
            "APPROVED",
            "REJECTED",
            "REFUND_PENDING",
            "REFUND_COMPLETED",
            "EXCHANGE_DISPATCHED",
            "EXCHANGE_DELIVERED",
            "CLOSED"
        ],
        default: "REQUESTED"
    },

    reason: String,

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    inspectionResult: {
        type: String,
        enum: ["PASS", "FAIL", "NOT_REQUIRED"],
        default: "NOT_REQUIRED"
    },

    refundAmount: Number,

    exchangeProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});


export default mongoose.model("ReturnRequest", returnRequestSchema);
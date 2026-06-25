import mongoose from "mongoose";

const InternalNoteSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },

        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Store",
            index: true
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            index: true
        },

        orderNumber: {
            type: String,
            index: true
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "low",
            index: true
        },

        category: {
            type: String,
            enum: ["delivery_issue", "customer_complaint", "payment", "return", "general"],
            default: "general"
        },
        
        isResolved: {
            type: Boolean,
            default: false,
            index: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
            required: true
        },


    },
    {
        timestamps: true,
    }
);

export default mongoose.model("InternalNote", InternalNoteSchema);
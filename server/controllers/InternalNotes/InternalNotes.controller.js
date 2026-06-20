import Order from "../../models/Order.js";
import Store from "../../models/Store.js";
import Customer from "../../models/Customer.js";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";
import InternalNotes from "../../models/InternalNotes.js";

export const getAllInternalNotes = async (req, res) => {
    try {

        const storeId = req?.storeId;
        const { priority, category, page = 1, limit = 10 } = req.query;

        const query = { storeId, isResolved: false };

        if (priority) {
            query.priority = priority;
        }

        if (category) {
            query.category = category;
        }

        const internalNotes = await InternalNotes.find(query)
            .skip((page - 1) * limit)
            .limit(limit);


        return res.status(200).json({
            success: true,
            internalNotes,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch internal notes",
            error: error.message
        })
    }
}
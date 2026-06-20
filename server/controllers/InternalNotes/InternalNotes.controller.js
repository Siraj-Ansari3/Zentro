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

export const markInternalNoteAsResolved = async (req, res) => {

    try {
        const { noteId, storeId } = req.body;
        const note = await InternalNotes.findOne({ _id: noteId, storeId });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Internal note not found"
            });
        }   

        note.isResolved = true;
        await note.save();

        return res.status(200).json({
            success: true,
            message: "Internal note marked as resolved"
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: "Failed to resolve internal note",
            error: error.message
        })
    }
}
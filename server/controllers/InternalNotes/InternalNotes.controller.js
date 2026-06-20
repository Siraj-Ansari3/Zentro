import Order from "../../models/Order.js";
import Store from "../../models/Store.js";
import Customer from "../../models/Customer.js";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";
import InternalNotes from "../../models/InternalNotes.js";

export const getAllInternalNotes = async (req, res) => {
    try {
        const storeId = req?.storeId;
        const showResolved = req.body?.showResolved || false; // Default to false if not provided
        

        // 2. Safe Integer Parsing with Fallbacks
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const { priority, category } = req.query;

        // 3. Build Query Dynamic Constraints
        const query = { storeId };

        if (!showResolved) {
            query.isResolved = false;
        }

        if (priority) query.priority = priority;
        if (category) query.category = category;

        // 4. Run database queries in parallel for maximum performance
        const [internalNotes, totalNotes] = await Promise.all([
            InternalNotes.find(query)
                .sort({ createdAt: -1 }) // Newest notes first
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("createdBy", "name email"), // Populates author data if needed
            InternalNotes.countDocuments(query)
        ]);

        // 5. Rich Pagination Metadata API Contract
        return res.status(200).json({
            success: true,
            pagination: {
                totalNotes,
                currentPage: page,
                totalPages: Math.ceil(totalNotes / limit),
                hasMore: page * limit < totalNotes
            },
            internalNotes,
        });

    } catch (error) {
        console.error("Internal Notes Retrieval Error:", error); // Log full stack trace internally
        return res.status(500).json({
            success: false,
            message: "Failed to fetch internal notes.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined // Don't leak raw errors to clients in prod
        });
    }
};

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
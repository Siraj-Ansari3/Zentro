import ReturnRequest from "../../models/ReturnRequest.js";


export const createReturnRequest = async (req, res) => {

    try {
        const { orderId, customerId, refundAmount, reason, initialNote, type } = req.body;

        const storeId = req.storeId;

        const newReturnRequest = new ReturnRequest({
            orderId,
            storeId,
            customerId,
            reason,
            refundAmount,
            // initialNote,
            createdBy: req.user.id,
            type
        });

        await newReturnRequest.save();

        res.status(201).json({ message: "Return request created successfully", data: newReturnRequest });
    } catch (error) {
        console.error("Error creating return request:", error);
        res.status(500).json({ message: "Failed to create return request" });
    }
}


export const fetchReturnRequests = async (req, res) => {

    try {

        const storeId = req.storeId;

        const requests = await ReturnRequest.find({ storeId })
        .populate({
            path: "orderId",
            select: "orderNumber shippingAddress.phone shippingAddress.fullName shippingAddress.city totalAmount"
        })
        .populate({
            path:"customerId",
            select: "fullName phone"
        })
        .populate({
            path: "createdBy",
            select: "displayName"
        })
        .sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Error fetching return request:", error);
        res.status(500).json({ message: "Failed to fetch return request" });
    }
}
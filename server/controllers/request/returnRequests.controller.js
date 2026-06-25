import Customer from "../../models/Customer.js";
import ReturnRequest from "../../models/ReturnRequest.js";
import Store from "../../models/Store.js";


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
                path: "customerId",
                select: "fullName phone"
            })
            .populate({
                path: "createdBy",
                select: "displayName"
            })
            .sort({ createdAt: -1 });

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

export const updateReturnRequestStatus = async (req, res) => {
    try {
        const storeId = req.storeId;
        const { requestId, status } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({
                success: false,
                message: "Both requestId and target status are required parameters."
            });
        }

        const updatedRequest = await ReturnRequest.findOneAndUpdate(
            { _id: requestId, storeId },
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedRequest) {
            return res.status(404).json({
                success: false,
                message: "Return request not found within this store's isolation scope."
            });
        }

       if (status === "APPROVED") {
            const targetCustomerId = updatedRequest.customerId;

            if (targetCustomerId) {
                // Fire both independent updates at the exact same time
                await Promise.all([
                    Customer.findOneAndUpdate(
                        { _id: targetCustomerId, storeId },
                        { $inc: { "metrics.returnedOrders": 1 } }
                    ),
                    Store.findOneAndUpdate(
                        { _id: storeId },
                        { $inc: { "metrics.returnedOrders": 1 } }
                    )
                ]);
            }
        }


        return res.status(200).json({
            success: true,
            message: `Return request status updated successfully to ${status}`,
            updatedRequest
        });

    } catch (error) {
        console.error("Return Pipeline Transition Failure:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal system error updating return request pipeline status."
        });
    }
};
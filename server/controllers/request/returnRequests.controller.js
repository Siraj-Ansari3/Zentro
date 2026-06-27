import Customer from "../../models/Customer.js";
import ReturnRequest from "../../models/ReturnRequest.js";
import Store from "../../models/Store.js";
import Order from "../../models/Order.js";

export const createReturnRequest = async (req, res) => {

    try {
        const { orderId, customerId, reason, refundAmount, exchangeProductName, initialNote, type } = req.body;

        const storeId = req.storeId;

        //Basic validation for required fields
        if (!orderId || !reason || !type) {
            return res.status(400).json({
                success: false,
                message: "orderId, reason, and type are required fields."
            });
        }

        if (type !== "RETURN" && type !== "EXCHANGE") {
            return res.status(400).json({
                success: false,
                message: "type must be either 'RETURN' or 'EXCHANGE'."
            });
        }

        // Conditional validation based on Type
        if (type === "RETURN" && refundAmount === undefined) {
            return res.status(400).json({
                success: false,
                message: "refundAmount is required for return requests."
            });
        }

        if (type === "EXCHANGE" && !exchangeProductName) {
            return res.status(400).json({
                success: false,
                message: "exchangeProductName is required for exchange requests."
            });
        }

        // saves from cross-tenant IDOR(Internal Data Object Reference) attacks
        const order = await Order.findOne({ _id: orderId, storeId });
        if (!order) {
            return res.status(404).json({ message: "Order not found or belongs to another store" });
        }

        // Validate refundAmount if provided
        if (type === "RETURN") {
            if ((!Number.isFinite(refundAmount) || refundAmount < 0 || refundAmount > order.totalAmount)) {
                return res.status(400).json({
                    success: false,
                    message: "Refund amount is out of acceptable bounds."
                });
            }
        }

        // Prevent returning orders that haven't been delivered or are already cancelled
        if (order.status !== "delivered") {
            return res.status(400).json({
                success: false,
                message: `Cannot create a return or exchange for an order with status: ${order.status}`
            });
        }


        // Assumes the return request has statuses like "CLOSED" or "REJECTED", prevents duplicate active return requests for the same order
        const existingReturn = await ReturnRequest.findOne({
            orderId,
            storeId,
            status: { $nin: ["CLOSED", "REJECTED"] } // Only block if there is an active/pending return
        });

        if (existingReturn) {
            return res.status(409).json({
                success: false,
                message: "An active return request or exchange already exists for this order."
            });
        }


        // We create a base payload, then add type-specific fields.
        const requestPayload = {
            orderId,
            storeId,
            customerId: order.customerId,
            reason,
            createdBy: req.user.id,
            type,
            // initialNote: initialNote // Uncomment if you are using this
        };

        if (type === "RETURN") {
            requestPayload.refundAmount = refundAmount;
        } else if (type === "EXCHANGE") {
            requestPayload.exchangeProductName = exchangeProductName;
        }

        const newReturnRequest = new ReturnRequest(requestPayload);
        await newReturnRequest.save();

        return res.status(201).json({
            success: true,
            message: `${type === 'RETURN' ? 'Return' : 'Exchange'} request created successfully.`,
            data: newReturnRequest
        });
    } catch (error) {
        console.error({
            controller: "createReturnRequest",
            storeId: storeId,
            userId: req.user.id,
            "Error creating return request:": error
        });
        res.status(500).json({ message: "Failed to create return request" });
    }
}


export const fetchReturnRequests = async (req, res) => {

    try {

        const storeId = req.storeId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

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
            .sort({ createdAt: -1 })
            .skip(skip)   // Pagination step 1: Skip older records
            .limit(limit) // Pagination step 2: Cap the payload size
            .lean();

        //calculate totalrecords for pagination metadata, very fast.
        const totalRecords = await ReturnRequest.countDocuments({ storeId });

        return res.status(200).json({
            success: true,
            pagination: {
                total: totalRecords,
                page,
                // pages: Math.ceil(totalRecords / limit),
                hasMore: page * limit < totalRecords
            },
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error({
            controller: "fetchReturnRequests",
            storeId: storeId,
            userId: req.user.id,
            "Error fetching return request:": error
        });
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

        //saves from cross-tenant IDOR(Internal Data Object Reference) attacks
        const requestDoc = await ReturnRequest.findOne({ _id: requestId, storeId });
        if (!requestDoc) {
            return res.status(404).json({
                success: false,
                message: "Return request not found within this store's isolation scope."
            });
        }

        //store the previous status before updating to decide if we need to increment or decrement the metrics
        const previousStatus = requestDoc.status;

        // Prevent redundant updates
        if (status === requestDoc.status) {
            return res.status(400).json({
                success: false,
                message: `Return request is already marked as ${status}, no changes made`
            });
        }

        // Update the status and save
        requestDoc.updatedBy = req.user.id;
        requestDoc.updatedAt = new Date();
        requestDoc.status = status;
        const updatedRequest = await requestDoc.save();


        //get valid customerId from the updated request to update metrics
        const targetCustomerId = updatedRequest.customerId;

        // Update metrics only if the request has a valid customerId and the status transition is relevant
        if (targetCustomerId) {
            // Scenario A: It just became APPROVED -> INCREMENT metrics
            if (previousStatus !== "APPROVED" && status === "APPROVED") {
                await Promise.all([
                    Customer.findOneAndUpdate({ _id: targetCustomerId, storeId }, { $inc: { "metrics.returnedOrders": 1 } }),
                    Store.findOneAndUpdate({ _id: storeId }, { $inc: { "metrics.returnedOrders": 1 } })
                ]);
            }

            // Scenario B (Optional but highly recommended): Reversing an approval -> DECREMENT metrics
            // (e.g., Staff clicked "Approved" by mistake, then changed it to "Rejected")
            if (previousStatus === "APPROVED" && status !== "APPROVED") {
                await Promise.all([
                    Customer.findOneAndUpdate({ _id: targetCustomerId, storeId }, { $inc: { "metrics.returnedOrders": -1 } }),
                    Store.findOneAndUpdate({ _id: storeId }, { $inc: { "metrics.returnedOrders": -1 } })
                ]);
            }
        }


        return res.status(200).json({
            success: true,
            message: `Return request status updated successfully to ${status}`,
            updatedRequest
        });

    } catch (error) {
        console.error({
            controller: "updateReturnRequestStatus",
            storeId: storeId,
            userId: req.user.id,
            "Return Pipeline Transition Failure:": error.message
        });
        return res.status(500).json({
            success: false,
            message: "Internal system error updating return request pipeline status."
        });
    }
};
import axios from "axios";
import Order from "../../models/Order.js";
import Courier from "../../models/Courier.js";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";

export const assignOrder = async (req, res) => {
    try {
        const storeId = req.storeId;
        const userId = req.user.id;
        const { courier, orderNumber } = req.body;

        // 1. Basic Validation
        if (!storeId || !courier || !orderNumber) {
            return res.status(400).json({
                success: false,
                message: "storeId, courier, and orderNumber are required"
            });
        }

        // 2. Fetch the Courier ID from the database
        const cleanCourierName = courier.trim();
        const existingCourier = await Courier.findOne({
            name: cleanCourierName
        });

        if (!existingCourier) {
            return res.status(404).json({
                success: false,
                message: `Courier '${courier}' is not found in the system.`
            });
        }

        const courierId = existingCourier._id;

        // 3. Fetch the Store's specific integration credentials
        const connectedCourierInfo = await StoreCourierIntegration.findOne({
            storeId,
            courierId,
            active: true
        });

        if (!connectedCourierInfo || !connectedCourierInfo?.active || !connectedCourierInfo.credentials?.apiKey) {
            return res.status(404).json({
                success: false,
                message: `${existingCourier.name} is not connected or inactive for this store.`,
            });
        }

        const apiKey = connectedCourierInfo.credentials.apiKey;

        // 4. Fetch Order Details
        const order = await Order.findOne({ orderNumber, storeId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.trackingNumber) {
            return res.status(400).json({
                success: false,
                message: "Order already assigned to courier",
            });
        }

        // ─────────────────────────────────────────────────────────
        // 5. DYNAMIC PICKUP ADDRESS RESOLUTION
        // ─────────────────────────────────────────────────────────
        // Try to grab it from the root of the document (or credentials as fallback)
        let pickupAddressCode = connectedCourierInfo.pickupAddressCode || connectedCourierInfo.credentials?.pickupAddressCode;

        // If it doesn't exist in the DB, fetch it from PostEx and save it
        if (!pickupAddressCode) {
            console.log("Pickup address not found in DB. Fetching from PostEx...");
            
            const addressResponse = await axios.get(
                "https://api.postex.pk/services/integration/api/order/v1/get-merchant-address",
                { headers: { token: apiKey } }
            );

            const addresses = addressResponse.data?.dist || [];
            
            if (addresses.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No pickup address configured in this PostEx account."
                });
            }

            // Find the Default Address, fallback to the first one if no default is explicitly marked
            const defaultAddress = addresses.find(addr => addr.addressType === "Default Address") || addresses[0];
            pickupAddressCode = defaultAddress.addressCode;

            // Save the newly found code back to the DB at the root level
            await StoreCourierIntegration.findByIdAndUpdate(connectedCourierInfo._id, {
                $set: { pickupAddressCode: pickupAddressCode }
            });
            
            console.log(`Saved new pickupAddressCode (${pickupAddressCode}) to database.`);
        }

        // ─────────────────────────────────────────────────────────
        // 6. Construct Payload & Create Order
        // ─────────────────────────────────────────────────────────
        const postExPayload = {
            cityName: order.shippingAddress.city,
            customerName: order.shippingAddress.fullName,
            customerPhone: order.shippingAddress.phone,
            deliveryAddress: order.shippingAddress.address,
            invoicePayment: 0, // Reminder: Use order.totalAmount if doing Cash On Delivery
            invoiceDivision: 0,
            pickupAddressCode: pickupAddressCode, // Injected from DB or freshly fetched
            items: order.items?.length || 1,
            orderDetail: order.items?.map(i => i.name).join(", ") || "No details",
            orderRefNumber: orderNumber,
            orderType: "Normal"
        };

        const response = await axios.post(
            `https://api.postex.pk/services/integration/api/order/v3/create-order`,
            postExPayload,
            { headers: { token: apiKey } }
        );

        // 7. Handle PostEx Success
        if (response.data.statusCode === "200") {
            const trackingNumber = response.data.dist.trackingNumber;
            const trackingUrl = `https://postex.pk/tracking?cn=${trackingNumber}`;
            
            // Update order with tracking info
            await Order.findOneAndUpdate(
                { orderNumber, storeId },
                {
                    trackingNumber: trackingNumber,
                    trackingUrl,
                    courierId,
                    courier: existingCourier.name,
                    assignedAt: new Date(),
                    status: 'assigned',
                    assignedTo: userId,
                    courierResponse: response.data,
                }
            );

            return res.status(200).json({
                success: true,
                message: `Order successfully assigned to ${existingCourier.name}`,
                trackingNumber: trackingNumber
            });
        }

        return res.status(400).json({
            success: false,
            message: `Failed to create order. ${existingCourier.name} responded with an error.`,
            error: response.data
        });

    } catch (error) {
        if (error.response) {
            console.error("Courier API Error:", error.response.data);
            return res.status(error.response.status).json({
                success: false,
                message: "Failed to assign order due to courier API error",
                error: error.response.data
            });
        }

        console.error("Assign Order System Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error while assigning order",
            error: error.message
        });
    }
};
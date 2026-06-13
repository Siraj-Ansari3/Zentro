import Order from "../../models/Order.js";
import Store from "../../models/Store.js";
import Customer from "../../models/Customer.js";
import axios from "axios";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const storeId = req.storeId;

    const {
      customer,         // { name, phone } for shippingAddress
      address,
      city,
      area,
      postalCode,
      items,
      paymentMethod,
      deliveryCharges,
      notes,
    } = req.body;



    // ─────────────────────────────
    // VALIDATION
    // ─────────────────────────────
    if (!customer?.name || !customer?.phone || !address) {
      return res.status(400).json({
        message: "Customer information or address is incomplete",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    // ─────────────────────────────
    // ✅ Fix 3: map items to schema shape
    // ─────────────────────────────

    const mappedItems = items.map((item) => ({
      productId: item.productId || null,
      name: item.name,
      sku: item.sku || "",
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    }));

    // ─────────────────────────────
    // CALCULATE TOTALS
    // ─────────────────────────────

    const subtotal = mappedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const shippingFee = deliveryCharges || 0;
    const totalAmount = subtotal + shippingFee;

    // ─────────────────────────────
    // GENERATE ORDER NUMBER
    // ─────────────────────────────

    const orderNumber =
      "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    let customerId = null; // Initialize customerId to null
    const existingCustomer = await Customer.findOne({ phone: customer.phone, storeId });
    customerId = existingCustomer ? existingCustomer._id : null;


    //if customer doesn't exist, create a new one
    if (!existingCustomer) {
      const newCustomer = await Customer.create({
        storeId,
        fullName: customer.name,
        phone: customer.phone,
        address,
        city,
        area,
        postalCode,
      });

      // Optionally, you can link the new customer to the order by setting customerId
      customerId = newCustomer._id; // Uncomment if you want to use this customerId in the order
    }

    // ─────────────────────────────
    // CREATE ORDER
    // ─────────────────────────────
    const order = await Order.create({
      storeId,
      customerId,                   // required ObjectId ref
      orderNumber,
      shippingAddress: {
        fullName: customer.name,
        phone: customer.phone,
        address,
        city,
        area: area || "",
        postalCode: postalCode || "",
      },

      items: mappedItems,

      paymentMethod,

      subtotal,
      shippingFee,
      totalAmount,

      packingStatus: "pending",
      verificationStatus: "pending",
      status: "new",

      ...(notes?.length && {
        notes: notes.map((text) => ({
          text,
          createdBy: userId,
        })),
      }),
    });

    // ─────────────────────────────
    // UPDATE STORE METRICS
    // ─────────────────────────────

    await Store.findByIdAndUpdate(storeId, {
      $inc: {
        "metrics.totalOrders": 1,
        "metrics.totalRevenue": totalAmount,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const { storeId } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    const orders = await Order.find({ storeId })
      .populate({
        path: "customerId",
        select: "customerId name phone email riskLevel trackingNumber",
      })
      // .populate({
      //   path: "courierId",
      //   select: "name",
      // })
      .populate({
        path: "assignedTo",
        select: "displayName email",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};





export const updateOrderStatus = async (req, res) => {
  try {
    const { orderNumber, status } = req.body;
    const storeId = req.storeId;
    const userId = req.user.id;

    console.log(orderNumber, status,);

    // 1. Basic Validation
    if (!orderNumber || !status) {
      return res.status(400).json({
        success: false,
        message: "orderNumber and status are required fields.",
      });
    }

    // Explicit validation matching your structural schema Enums
    const validStatuses = [
      "new",
      "verified",
      "assigned",
      "shipped",
      "in_transit",
      "delivered",
      "failed_delivery",
      "returned",
      "cancelled"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status code tracking indicator: '${status}'`,
      });
    }

    // 2. Locate the Order
    const order = await Order.findOne({ orderNumber, storeId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found within this store's scope.",
      });
    }

    // 3. Build Dynamic Fields Modifications Base Objects
    const updateFields = {};
    let timelineMessage = `Order status updated to ${status.replace("_", " ")}`;

    // Handle pipeline structural changes dependencies dynamically
    if (status === "verified") {
      updateFields.status = "verified"
      updateFields.verificationStatus = "verified";
      timelineMessage = "Order verified successfully.";
    }

    if (status === "packed") {
      // updateFields.verificationStatus = "verified";
      updateFields.packingStatus = "packed";
      timelineMessage = "Order packed successfully.";
    }

    // if (status === "ready_to_ship") {
    //   updateFields.verificationStatus = "verified";
    //   updateFields.packingStatus = "packed";
    //   updateFields.readyToShipAt = new Date();
    //   timelineMessage = "Order is ready to ship.";
    // }



    if (status === "delivered") {
      updateFields.deliveredAt = new Date();
      updateFields.paymentStatus = "paid"; // Assuming completion means settlement for cash allocations
      timelineMessage = "Order marked as delivered.";
    }

    // if (status === "pending_verification") {
    //   updateFields.verificationStatus = "pending";
    //   // updateFields.packingStatus = "pending";
    //   timelineMessage = "Order returned back to pending verification queue.";
    // }

    // 4. Update Document and Append to Operations Timeline Array
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber, storeId },
      {
        $set: updateFields,
        $push: {
          timeline: {
            type: "status_change",
            message: timelineMessage,
            createdBy: userId,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Order pipeline state adjusted successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Order Status Update System Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error adjusting order status parameters.",
      error: error.message,
    });
  }
};
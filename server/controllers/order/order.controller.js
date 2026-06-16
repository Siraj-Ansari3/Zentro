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

    let status;
    let verificationStatus;
    let packingStatus;

    if (paymentMethod === "prepaid" || paymentMethod === "bank_transfer") {
      status = "verified";
      verificationStatus = "verified";
      packingStatus = "pending";
    } else {
      status = "new";
      verificationStatus = "pending";
      packingStatus = "pending";
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

      packingStatus,
      verificationStatus,
      status,

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

    // await Customer.findOneAndUpdate(
    //   { _id: customerId },
    //   {
    //     $inc: {
    //       "metrics.totalOrders": ++1,
    //     }
    //   }
    // );

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
    const statusChangeReason = req.body.statusChangeReason || "";
    const storeId = req.storeId;
    const userId = req.user.id;


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
    let adjustedRiskScore = 0; // Default no change, will adjust based on status transitions
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

    if (status === "shipped") {
      updateFields.status = "shipped";
      updateFields.shippedAt = new Date();
      timelineMessage = "Order marked as shipped.";
    }

    if (status === "delivered") {
      if (statusChangeReason === "Force Marked Delivered") {
      adjustedRiskScore = -5; // Example: reduce risk score on successful delivery
      }
      updateFields.status = "delivered";
      updateFields.deliveredAt = new Date();
      updateFields.paymentStatus = "paid"; 
      timelineMessage = "Order marked as delivered.";
    }

    if (status === "failed_delivery") {

      console.log("Status change reason for failed delivery:", statusChangeReason);
      if (statusChangeReason=== "Customer Not Available") {
        adjustedRiskScore = 5; // Moderate risk increase for no-shows
      } else if (statusChangeReason === "Incorrect Address") {
        adjustedRiskScore = 10; // Higher risk increase for address issues
      } else if (statusChangeReason === "Refused at Delivery") {
        adjustedRiskScore = 15; // Higher risk increase for refusals
      } else if (statusChangeReason === "Manually Canceled") {
        adjustedRiskScore = 5; 
      } else {
        adjustedRiskScore = 5; // Default risk increase for other failure reasons
      }
      updateFields.status = "failed_delivery";
      updateFields.failedReason = statusChangeReason;
      timelineMessage = "Order marked as failed delivery.";
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

    await Customer.findByIdAndUpdate(updatedOrder.customerId, {
      $inc: {
        riskScore: adjustedRiskScore,
      },
    });

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


export const getPendingPackingOrders = async (req, res) => {
  try {
    // Guaranteed to exist and be authorized by your requireStoreAccess middleware
    const storeId = req.storeId;

    // 1. Extract pagination, sorting, and search parameter filters from query
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // 2. Construct the query object targeting 'pending' packing status
    const query = {
      storeId,
      packingStatus: "pending"
    };

    // If search is utilized (searching by Order ID, customer name, or phone)
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } }
      ];
    }

    // 3. Configure pagination skips and sorting models
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // 4. Query DB in parallel for optimal scaling performance
    // Using .lean() optimization to strip heavy Mongoose document wrappers
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    // 5. Return paginated data block mapping exactly to frontend table expectations
    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
        }
      }
    });

  } catch (error) {
    console.error("Fetch Pending Packing Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching pending packing orders.",
      error: error.message
    });
  }
};

export const updatePackingStatus = async (req, res) => {
  try {
    const { orderNumber, packingStatus } = req.body;
    const storeId = req.storeId;
    const userId = req.user.id;
    // 1. Basic Validation
    if (!orderNumber || !packingStatus) {
      return res.status(400).json({
        success: false,
        message: "orderNumber and packingStatus are required fields.",
      });
    }

    // Explicit validation matching your structural schema Enums
    const validPackingStatuses = ["pending", "in_progress", "packed"];
    if (!validPackingStatuses.includes(packingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid packingStatus code: '${packingStatus}'`,
      });
    }
    // 2. Locate the Order
    const order = await Order.findOneAndUpdate(
      { orderNumber, storeId },
      { packingStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Packing status updated successfully.",
      order,
    });

  } catch (error) {
    console.error("Packing Status Update System Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error adjusting packing status parameters.",
      error: error.message,
    });
  }
}



export const getUnassignedOrders = async (req, res) => {
  try {
    // Securely attached by your requireStoreAccess middleware
    const storeId = req.storeId;

    const {
      page = 1,
      limit = 15,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query: Must be 'packed' and have no courier tracking details assigned yet
    const query = {
      storeId,
      status: "verified",
      $or: [
        { trackingNumber: "" },
        { trackingNumber: { $exists: false } },
        { courierId: null }
      ]
    };

    // Support searching by Order ID, customer name, or phone number
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Fetch records and totals in parallel for maximum database speed
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Fetch Unassigned Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching unassigned orders.",
      error: error.message,
    });
  }
};



export const getReadyToShipOrders = async (req, res) => {
  try {
    // Securely provided by your requireStoreAccess middleware
    const storeId = req.storeId;

    const {
      page = 1,
      limit = 20,
      search = "",
      courier = "",
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.query;

    // Build base query matching packed orders booked with tracking data
    const query = {
      storeId,
      status: { $in: ["assigned", "booked", "ready_to_ship"] },
    };

    // Filter by specific courier if selected in UI
    if (courier) {
      query.courier = courier;
    }

    // Support barcode scanners searching tracking IDs directly
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Fetch matching data and count profiles concurrently
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Fetch Ready to Ship Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error gathering ready-to-ship payloads.",
      error: error.message,
    });
  }
};
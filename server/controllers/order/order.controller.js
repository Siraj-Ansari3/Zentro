import Order from "../../models/Order.js";
import Store from "../../models/Store.js";
import Customer from "../../models/Customer.js";

export const createOrder = async (req, res) => {
  try {
    // ✅ Fix 1: req.user.id, not req.user._id
    const userId = req.user.id;

    // ✅ Fix 2: storeId from middleware, not re-read from body
    const storeId = req.storeId;

    const {
      // customerId,       // must be a valid Customer ObjectId
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

    // return res.status(200).json({
    //   message: "Received order data",
    //   customer: req.body.customer,
    // });
    console.log(customer.name);
    // ─────────────────────────────
    // VALIDATION
    // ─────────────────────────────

    // if (!customerId) {
    //   return res.status(400).json({
    //     message: "customerId is required",
    //   });
    // }

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
      unitPrice: item.price,                        // schema field is unitPrice
      totalPrice: item.price * item.quantity,       // schema field is totalPrice
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
      shippingFee,                  // ✅ Fix 5: correct schema field name
      totalAmount,

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
    console.log("Get All Orders - Query Params:", req.query);
    const { storeId } = req.query;
    console.log("Fetching orders for storeId:", storeId);

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
import Order from "../../models/Order.js";
import Store from "../../models/Store.js";

export const createOrder = async (req, res) => {
  try {
    // ✅ Fix 1: req.user.id, not req.user._id
    const userId = req.user.id;

    // ✅ Fix 2: storeId from middleware, not re-read from body
    const storeId = req.storeId;

    const {
      customerId,       // must be a valid Customer ObjectId
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

    if (!customerId) {
      return res.status(400).json({
        message: "customerId is required",
      });
    }

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

    // ─────────────────────────────
    // CREATE ORDER
    // ─────────────────────────────

    const order = await Order.create({
      storeId,
      customerId,                   // required ObjectId ref

      orderNumber,

      // ✅ Fix 4: nested shippingAddress, not flat fields
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
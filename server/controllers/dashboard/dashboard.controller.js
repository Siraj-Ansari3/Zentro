import Membership from "../../models/Membership.js";
import Store from "../../models/Store.js";

export const getDashboardStats = async (req, res) => {
  try {
    const storeId = req.storeId;
    if (!storeId) {
      return res.status(400).json({
        message: "Store ID required",
      });
    }

    // ─────────────────────────────────
    // REAL DATA
    // (placeholder until orders exist)
    // ─────────────────────────────────
const storeData = await Store.findById(storeId, { metrics: 1 });

    // 3. Safety Check: Handle case where store is not found in DB
    if (!storeData || !storeData.metrics) {
      return res.status(404).json({
        success: false,
        message: "Store dashboard data parameters could not be found.",
      });
    }

    // 4. Safe Payload Extraction with Zero-Fallbacks (Destructuring)
    const {
      totalRevenue = 0,
      totalOrders = 0,
      activeShipments = 0,
      codSuccessRate = 0,
      cancelledOrders = 0,
      returnedOrders = 0,
      deliveredOrders = 0,
    } = storeData.metrics;

    // 5. Clean, predictable response structure
    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        activeShipments,
        codSuccessRate,
        cancelledOrders,
        returnedOrders,
        deliveredOrders,
      },
    });

    //   revenueChart,
    //   topProducts,
    //   recentActivity

 

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};
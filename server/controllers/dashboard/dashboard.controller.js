import Membership from "../../models/Membership.js";
import Store from "../../models/Store.js";

export const getDashboardStats = async (req, res) => {
  try {
    const storeId = req.query.storeId;
    if (!storeId) {
      return res.status(400).json({
        message: "Store ID required",
      });
    }

    // ─────────────────────────────────
    // VERIFY USER BELONGS TO STORE
    // ─────────────────────────────────
    const membership = await Membership.findOne({
      userId: req.user.id,
      storeId,
      status: "approved",
    });

    if (!membership) {
      return res.status(403).json({
        message: "Unauthorized store access",
      });
    }

    // ─────────────────────────────────
    // REAL DATA
    // (placeholder until orders exist)
    // ─────────────────────────────────
    const dashboardData = {
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        activeCustomers: 0,
        conversionRate: 0,
      },

      revenueChart: [
        10, 25, 30, 22, 50, 65,
        40, 80, 72, 95, 120, 140,
      ],

      topProducts: [],

      recentActivity: [],

      store: {
        id: storeId,
      },
    };

    return res.json(dashboardData);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};
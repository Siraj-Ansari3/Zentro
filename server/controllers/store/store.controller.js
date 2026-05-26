import Store from "../../models/Store.js";
import Membership from "../../models/Membership.js";

import generateSlug from "../../utils/generateSlug.js";
import generateStoreKey from "../../utils/generateStoreKey.js";

export const createStore = async (req, res) => {
  try {
    const { name, description } = req.body;

    // ─────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        message: "Store name must be at least 3 characters",
      });
    }

    // ─────────────────────────────────
    // GENERATE DATA
    // ─────────────────────────────────
    const slug = generateSlug(name);

    const storeKey = generateStoreKey();

    // ─────────────────────────────────
    // CREATE STORE
    // ─────────────────────────────────
    const store = await Store.create({
      name,
      description,
      slug,
      storeKey,
      ownerId: req.user.id,
    });

    // ─────────────────────────────────
    // CREATE OWNER MEMBERSHIP
    // ─────────────────────────────────
    await Membership.create({
      userId: req.user.id,
      storeId: store._id,

      role: "super_admin",
      status: "approved",

      approvedAt: new Date(),

      permissions: {
        canManageUsers: true,
        canManageOrders: true,
        canAssignCouriers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canDeleteOrders: true,
      },
    });

    return res.status(201).json({
      message: "Store created successfully",
      store,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to create store",
    });
  }
};
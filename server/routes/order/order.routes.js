import express from "express";

import { createOrder, getAllOrders, getPendingPackingOrders, getReadyToShipOrders, getUnassignedOrders, updateOrderStatus, updatePackingStatus } from "../../controllers/order/order.controller.js";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js"
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";
import { assignOrder } from "../../controllers/order/assignOrder.js";

// order.routes.js (and any other sub-router)
const router = express.Router({ mergeParams: true }); // 👈 this

// CREATE ORDER
router.post("/",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin"),
    createOrder);

router.get("/get_all_orders",
    verifyAuth, // Not needed for this route since it's just fetching orders and not creating/updating
    attachUser, // Not needed for this route since it's just fetching orders and not creating/updating
    // requireStoreAccess("super_admin", "admin"),  
    getAllOrders);

router.post("/assign_order",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin"),
    assignOrder);


router.put(
    "/update_status",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "editor", "packer"),
    updateOrderStatus
);


router.get(
  "/pending-packing",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin", "manager", "packer"),
  getPendingPackingOrders
);


router.put(
  "/update_packing_status",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin", "manager", "packer"),
  updatePackingStatus
);


router.get("/unassigned",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "packer"),
    getUnassignedOrders
);


router.get(
  "/ready-to-ship",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin", "manager", "dispatcher"),
  getReadyToShipOrders
);
export default router;
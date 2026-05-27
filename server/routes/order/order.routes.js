import express from "express";

import { createOrder, getAllOrders } from "../../controllers/order/order.controller.js";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js"
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

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

export default router;
import express from "express";

import { createOrder } from "../../controllers/order/order.controller.js";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js"
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

const router = express.Router();

// CREATE ORDER
router.post("/", 
    verifyAuth, 
    attachUser, 
    requireStoreAccess("super_admin","admin"), 
    createOrder);

export default router;
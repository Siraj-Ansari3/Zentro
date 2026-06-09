import express from "express";
import { getCustomers } from "../../controllers/customer/customer.controller.js";
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js";
import { attachUser } from "../../middlewares/attachUser.js";

const router = express.Router();



// GET /api/customers?page=1&limit=25&search=ali&riskLevel=high
router.get("/",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "editor", "support", "packer", "viewer"),
    getCustomers);

export default router;
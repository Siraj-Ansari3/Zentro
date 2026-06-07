import express from "express";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js";
import { getJoinRequests } from "../../controllers/request/getJoinRequests.controller.js";
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";


const router = express.Router();

// 1. User must be logged in
// 2. User must have access to the store AND be a super_admin or admin
// 3. Finally, execute the controller
router.get(
  "/join-requests",
  verifyAuth,
  attachUser, 
  requireStoreAccess("super_admin", "admin"), 
  getJoinRequests
);

export default router;
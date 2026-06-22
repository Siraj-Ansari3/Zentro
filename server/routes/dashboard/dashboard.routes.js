import express from "express";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

import { getDashboardStats} from "../../controllers/dashboard/dashboard.controller.js";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js";

const router = express.Router();

router.get(
  "/stats",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin", "manager", "packer", "viewer", "editor"),
  getDashboardStats
);

export default router;
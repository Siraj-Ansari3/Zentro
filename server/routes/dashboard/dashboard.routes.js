import express from "express";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

import { getDashboardStats} from "../../controllers/dashboard/dashboard.controller.js";

const router = express.Router();

router.get(
  "/stats",
  verifyAuth,
  attachUser,
  getDashboardStats
);

export default router;
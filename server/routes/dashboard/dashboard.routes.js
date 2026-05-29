import express from "express";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

import { getDashboardStats} from "../../controllers/dashboard/dashboard.controller.js";

const router = express.Router();

router.get(
  "/stats",
  (req, res, next) => {
    console.log("Received request for dashboard stats with query:", req.query);
    next();
  },
  verifyAuth,
  attachUser,
  getDashboardStats
);

export default router;
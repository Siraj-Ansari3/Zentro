import express from "express";
import axios from "axios";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";
import { testCourierConnection } from "../../middlewares/courier/testCourierConnection.js";

import { getStoreCourierIntegrations } from "../../controllers/courier/getStoreCourierIntegrations.js";
import { connectCourier } from "../../controllers/courier/connectCourier.js";
import { disconnectCourier } from "../../controllers/courier/disconnectCourier.js";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js";

const router = express.Router();

router.post(
  "/connect",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin"),
  testCourierConnection,
  connectCourier
);

router.get(
  "/integrations",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin"),
  getStoreCourierIntegrations
);

router.post(
  "/disconnect",
  verifyAuth,
  attachUser,
  requireStoreAccess("super_admin", "admin"),
  disconnectCourier
);

export default router;
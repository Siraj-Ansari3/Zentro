import express from "express";
import axios from "axios";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";
import { testCourierConnection } from "../../middlewares/courier/testCourierConnection.js";

import { getStoreCourierIntegrations } from "../../controllers/courier/getStoreCourierIntegrations.js";
import { connectCourier } from "../../controllers/courier/connectCourier.js";
import { disconnectCourier } from "../../controllers/courier/disconnectCourier.js";

const router = express.Router();

router.post(
  "/connect",
  testCourierConnection,
  connectCourier
);

router.get(
  "/integrations",
  // verifyAuth,
  // attachUser,
  getStoreCourierIntegrations
);

router.post(
  "/disconnect",
  // verifyAuth,
  // attachUser,
  disconnectCourier
);

export default router;
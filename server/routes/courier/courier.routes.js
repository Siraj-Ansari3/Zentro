import express from "express";
import axios from "axios";

import { connectCourier } from "../../controllers/courier/connectCourier.js";
import { testPostExConnection } from "../../controllers/courier/testPostexConnection.js";

const router = express.Router();

router.post(
  "/connect",
   testPostExConnection
//   connectCourier
);

export default router;
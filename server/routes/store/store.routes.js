import express from "express";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

import { createStore } from "../../controllers/store/store.controller.js";
import { joinStore } from "../../controllers/store/joinStore.controller.js";

const router = express.Router();

// ─────────────────────────────────────
// CREATE STORE
// ─────────────────────────────────────
router.post(
  "/",
  verifyAuth,
  attachUser,
  createStore
);

router.post(
  "/join",
  verifyAuth,
  attachUser,
  joinStore
);
export default router;
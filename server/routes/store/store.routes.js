import express from "express";

import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

import { createStore } from "../../controllers/store/store.controller.js";

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

export default router;
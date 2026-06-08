import express from "express";
import { updateProfile } from "../../controllers/profile/userProfile.controller.js";
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";

const router = express.Router();


router.put("/profile", verifyAuth, attachUser, updateProfile);

export default router;
import express from "express";

import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js"
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";
import { getAllInternalNotes, markInternalNoteAsResolved } from "../../controllers/InternalNotes/InternalNotes.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/get_all",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "editor", "packer"),
    getAllInternalNotes
);

router.patch("/resolve",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "editor", "packer"),
    markInternalNoteAsResolved
);




export default router;

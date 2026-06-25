import express from "express";
import { requireStoreAccess } from "../../middlewares/requireStoreAccess.js";
import { approveJoinRequest, getJoinRequests } from "../../controllers/request/joinRequests.controller.js";
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { attachUser } from "../../middlewares/attachUser.js";
import { createReturnRequest, fetchReturnRequests, updateReturnRequestStatus } from "../../controllers/request/returnRequests.controller.js";


const router = express.Router();

// 1. User must be logged in
// 2. User must have access to the store AND be a super_admin or admin
// 3. Finally, execute the controller
router.get(
    "/join-requests",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin"),
    getJoinRequests
);

router.post(
    "/join-requests/approve",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin"),
    approveJoinRequest
);

// router.post(
//     "/join-requests/reject",
//     verifyAuth,  
//     attachUser,
//     requireStoreAccess("super_admin", "admin"),
//     rejectJoinRequest
// );

// creates return and echange requests
router.post("/returns",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "editor"),
    createReturnRequest
)

// fetches return and exchange requests
router.get("/returns",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager"),
    fetchReturnRequests
)

router.patch("/returns/updateStatus",
    verifyAuth,
    attachUser,
    requireStoreAccess("super_admin", "admin", "manager", "editor", "packer"),
    updateReturnRequestStatus
)

export default router;
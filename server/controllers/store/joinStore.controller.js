import Store from "../../models/Store.js";
import Membership from "../../models/Membership.js";
import JoinRequest from "../../models/JoinRequest.js"; 

export const joinStore = async (req, res) => {
  try {
    const { storeKey, requestedRole } = req.body;
    const userId = req.user.id; 

    // ─────────────────────────────────
    // 1. BASIC VALIDATION
    // ─────────────────────────────────
    if (!storeKey) {
      return res.status(400).json({ message: "Store key is required" });
    }

    // Ensure the role is valid against your JoinRequest enum
    const allowedRoles = ["editor", "packer", "dispatcher", "support", "viewer"];
    const validRole = allowedRoles.includes(requestedRole) ? requestedRole : "viewer";


    // ─────────────────────────────────
    // 2. FIND STORE BY KEY
    // ─────────────────────────────────
    const store = await Store.findOne({ storeKey });

    if (!store) {
      return res.status(404).json({ message: "Invalid store key. Store not found." });
    }

    if (!store.isActive || store.isBlocked) {
      return res.status(403).json({ message: "This store is currently inactive or blocked." });
    }

    // ─────────────────────────────────
    // 3. CHECK ACTUAL MEMBERSHIPS
    // ─────────────────────────────────
    // First, verify they aren't ALREADY a member of the store
    const existingMembership = await Membership.findOne({
      userId,
      storeId: store._id,
    });

    if (existingMembership) {
      if (existingMembership.status === "approved") {
        return res.status(400).json({ message: "You are already a member of this store." });
      }
      if (existingMembership.status === "suspended") {
        return res.status(403).json({ message: "Your access to this store has been suspended." });
      }
    }

    // ─────────────────────────────────
    // 4. CHECK PENDING REQUESTS
    // ─────────────────────────────────
    // Prevent the user from spamming the "Join" button
    const existingRequest = await JoinRequest.findOne({
      userId,
      storeId: store._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: "You already have a pending request to join this store. Please wait for an admin to review it." 
      });
    }

    // Optional: Check if they were recently rejected and decide if you want to block re-application
    const rejectedRequest = await JoinRequest.findOne({
      userId,
      storeId: store._id,
      status: "rejected",
    });
    
    // If you want to block rejected users from re-applying, uncomment this:
    if (rejectedRequest) {
      return res.status(403).json({ message: "Your previous request to join this store was rejected." });
    }

    // ─────────────────────────────────
    // 5. CREATE THE JOIN REQUEST
    // ─────────────────────────────────
    await JoinRequest.create({
      userId,
      storeId: store._id,
      requestedRole: validRole,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully! Waiting for admin approval.",
    });

  } catch (err) {
    console.error("Join Store Error:", err);

    return res.status(500).json({
      message: "An error occurred while trying to join the store.",
    });
  }
};
import JoinRequest from "../../models/JoinRequest.js";
import Membership from "../../models/Membership.js";

// ─────────────────────────────────────────────────────────────
// ROLE PERMISSION MAPPINGS
// ─────────────────────────────────────────────────────────────
// Maps the requested role to the specific granular permissions
// defined in your MembershipSchema.
const ROLE_PERMISSIONS = {
  editor: {
    canManageUsers: false,
    canManageOrders: true,
    canAssignCouriers: true,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteOrders: false,
  },
  packer: {
    canManageUsers: false,
    canManageOrders: true, // Needs access to view/update packing status
    canAssignCouriers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteOrders: false,
  },
  dispatcher: {
    canManageUsers: false,
    canManageOrders: true,
    canAssignCouriers: true,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteOrders: false,
  },
  support: {
    canManageUsers: false,
    canManageOrders: true, // View/edit order details for customers
    canAssignCouriers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteOrders: false,
  },
  viewer: {
    canManageUsers: false,
    canManageOrders: false,
    canAssignCouriers: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteOrders: false,
  },
};



export const getJoinRequests = async (req, res) => {
  try {
    // 1. storeId is guaranteed by your middleware
    const storeId = req.storeId; 
    const { status = "pending" } = req.query;

    // 2. (Optional but Recommended) Granular Permission Check
    // Your middleware checks the ROLE, but your schema has specific PERMISSIONS.
    // Since the middleware already fetched the membership, we can check it instantly.
    if (!req.membership.permissions.canManageUsers) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to manage users.",
      });
    }

    // 3. Build Query & Fetch
    const query = { storeId };
    
    if (status !== "all") {
      query.status = status;
    }

    const requests = await JoinRequest.find(query)
      .populate("userId", "name email") 
      .sort({ createdAt: -1 });

    // 4. Send Response
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });

  } catch (err) {
    console.error("Fetch Join Requests Error:", err);
    
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while fetching join requests.",
    });
  }
};





// ─────────────────────────────────────────────────────────────
// APPROVE REQUEST
// ─────────────────────────────────────────────────────────────
export const approveJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const storeId = req.storeId; // Guaranteed by requireStoreAccess middleware
    const adminId = req.user.id; // The super_admin/admin doing the approving

    if (!requestId) {
      return res.status(400).json({ success: false, message: "requestId is required" });
    }

    // 1. Fetch the request ensuring it belongs to the current store
    const joinRequest = await JoinRequest.findOne({
      _id: requestId,
      storeId: storeId,
    });

    if (!joinRequest) {
      return res.status(404).json({ success: false, message: "Join request not found." });
    }

    if (joinRequest.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `This request has already been ${joinRequest.status}.` 
      });
    }

    // 2. Resolve the exact permissions for this role
    const permissions = ROLE_PERMISSIONS[joinRequest.requestedRole] || ROLE_PERMISSIONS["viewer"];

    // 3. Upsert the Membership
    // Using findOneAndUpdate with upsert: true handles the edge case where the user
    // previously had a rejected/suspended membership that is now being reactivated.
    const membership = await Membership.findOneAndUpdate(
      { userId: joinRequest.userId, storeId: storeId },
      {
        $set: {
          role: joinRequest.requestedRole,
          status: "approved",
          approvedBy: adminId,
          approvedAt: new Date(),
          permissions: permissions,
        }
      },
      { new: true, upsert: true }
    );

    // 4. Mark the JoinRequest as processed
    joinRequest.status = "approved";
    joinRequest.reviewedBy = adminId;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    return res.status(200).json({
      success: true,
      message: `User approved as ${joinRequest.requestedRole} successfully.`,
      membership,
    });

  } catch (error) {
    console.error("Approve Join Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while approving the request.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// REJECT REQUEST
// ─────────────────────────────────────────────────────────────
export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    const storeId = req.storeId; 
    const adminId = req.user.id; 

    if (!requestId) {
      return res.status(400).json({ success: false, message: "requestId is required" });
    }

    // 1. Find the request
    const joinRequest = await JoinRequest.findOne({
      _id: requestId,
      storeId: storeId,
    });

    if (!joinRequest) {
      return res.status(404).json({ success: false, message: "Join request not found." });
    }

    if (joinRequest.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `This request has already been ${joinRequest.status}.` 
      });
    }

    // 2. Mark the JoinRequest as rejected
    joinRequest.status = "rejected";
    joinRequest.reviewedBy = adminId;
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // 3. Optional: Sync to Membership collection if they already exist
    // If they have an existing pending membership, update it to rejected.
    await Membership.findOneAndUpdate(
      { userId: joinRequest.userId, storeId: storeId, status: "pending" },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date(),
          rejectionReason: reason || "Declined by admin",
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Request has been rejected.",
    });

  } catch (error) {
    console.error("Reject Join Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while rejecting the request.",
    });
  }
};
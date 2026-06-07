import JoinRequest from "../../models/JoinRequest.js";

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
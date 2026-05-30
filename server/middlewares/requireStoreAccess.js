import Membership from "../models/Membership.js";

export const requireStoreAccess = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // let storeId;
      // if (req.body.storeId) {
      //   storeId = req.body.storeId
      // }


      // if (req.query.storeId) {
      //   storeId = req.query.storeId
      // }


      const storeId = req.body?.storeId || req.query?.storeId;

      console.log("Checking store access for storeId:", storeId, "and userId:", req.user.id);
      
      if (!storeId) {
        return res.status(400).json({ message: "storeId is required" });
      }


      const membership = await Membership.findOne({
        userId: req.user.id,
        storeId,
        status: "approved",
      });

      if (!membership) {
        return res.status(403).json({
          message: "No access to this store",
        });
      }

      // attach membership to request
      req.membership = membership;
      req.storeId = storeId;

      // if roles are required
      if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(membership.role)) {
          return res.status(403).json({
            message: "Forbidden: insufficient store role",
          });
        }
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Store access check failed" });
    }
  };
};
import admin from "../config/firebaseAdmin.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decoded; // uid, email, etc.

    next();
  } catch (err) {
    console.error("Error verifying auth token:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
import User from "../models/User.js";

export const attachUser = async (req, res, next) => {
  try {
    const { uid, email } = req.firebaseUser;

    let user = await User.findOne({ firebaseUid: uid });


    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
      });
    }

    req.user = {
      id: user._id,
      firebaseUid: uid,
      email,
      dbUser: user,
    };

    next();
  } catch (err) {
    console.error("Error attaching user:", err);
    return res.status(500).json({ message: "User attach failed" });
  }
};
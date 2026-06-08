import User from "../../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const { displayName } = req.body;
    const userId = req.user.id; // Assumes your auth middleware attaches the Mongo _id here

    // ─────────────────────────────────
    // 1. INPUT VALIDATION
    // ─────────────────────────────────
    if (displayName === undefined || typeof displayName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Display name must be a valid string.",
      });
    }

    const cleanDisplayName = displayName.trim();

    if (cleanDisplayName.length < 2 || cleanDisplayName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Display name must be between 2 and 50 characters.",
      });
    }

    // ─────────────────────────────────
    // 2. DATABASE UPDATE
    // ─────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { displayName: cleanDisplayName } 
      },
      { 
        new: true,           
        runValidators: true, 
      }
    );

    // Failsafe in case the user's account was deleted from the DB
    // but they still have a valid Firebase token
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // ─────────────────────────────────
    // 3. SUCCESS RESPONSE
    // ─────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser?._id,
        email: updatedUser?.email,
        displayName: updatedUser?.displayName,
        role: updatedUser?.role,
        photoURL: updatedUser?.photoURL
      },
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while updating your profile.",
      error: error.message
    });
  }
};
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    displayName: {
      type: String,
      default: "",
    },

    photoURL: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
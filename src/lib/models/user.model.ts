import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: false, required: false }, // Clerk user ID
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    phone: { type: String }, // Optional
    onboarded: { type: Boolean, default: false }, // Add onboarded field
  },
  { timestamps: true }
);

// Ensure the model is exported correctly
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;

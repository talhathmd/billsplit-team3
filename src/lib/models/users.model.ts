import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: true, required: true }, // Clerk user ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true }, // Optional
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

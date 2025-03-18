import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }, // Optional
    onboarded: { type: Boolean, default: false }, // Add onboarded field
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }], // Reference to Contact model
  },
  { timestamps: true }
);

// Ensure the model is exported correctly
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;

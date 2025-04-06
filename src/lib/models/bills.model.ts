import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who uploaded
    imageUrl: String, // Bill image (stored in Firebase/AWS)
    totalAmount: Number, // Total bill amount
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }], // People involved
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);

export default Bill;

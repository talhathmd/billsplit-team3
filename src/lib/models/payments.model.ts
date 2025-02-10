import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The person paying
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The person owed money
    amount: { type: Number, required: true }, // Amount owed
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

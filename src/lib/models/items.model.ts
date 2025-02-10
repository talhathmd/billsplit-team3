import mongoose from "mongoose";

const BillItemSchema = new mongoose.Schema(
  {
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true }, // Linked bill
    name: { type: String, required: true }, // Item name (from OCR)
    price: { type: Number, required: true }, // Item price
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // People splitting this item
  },
  { timestamps: true }
);

export default mongoose.models.BillItem || mongoose.model("BillItem", BillItemSchema);

import mongoose, { Document } from 'mongoose';

export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  assignedContacts: string[]; // Array of contact IDs
}

export interface BillDocument extends Document {
  _id: string;
  clerkId: string;
  storeName: string;
  address: string;
  phoneNumber: string;
  date: string;
  time: string;
  items: BillItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  imageUrl: string;
  tipAmount: number;  // Added tipAmount field
}

const billSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
  },
  storeName: String,
  address: String,
  phoneNumber: String,
  date: String,
  time: String,
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    assignedContacts: [String]
  }],
  subtotal: Number,
  totalTax: Number,
  total: Number,
  imageUrl: String,
  tipAmount: { type: Number, default: 0 }  // Added tipAmount field with default 0
}, { timestamps: true });

const Bill = mongoose.models.Bill || mongoose.model<BillDocument>('Bill', billSchema);

export default Bill;
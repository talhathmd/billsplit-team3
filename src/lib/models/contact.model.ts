import mongoose, { Document } from 'mongoose';

export interface ContactDocument extends Document {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
}

const contactSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  }
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model<ContactDocument>('Contact', contactSchema);

export default Contact; 
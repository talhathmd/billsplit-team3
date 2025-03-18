import mongoose from 'mongoose';

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

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact; 
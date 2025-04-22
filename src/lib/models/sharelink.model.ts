import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema({
    billId: { type: String, required: true },
    contactId: { type: String, required: true },
    shareId: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days from creation
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid'],
        default: 'pending'
    }
});

const ShareLink = mongoose.models.ShareLink || mongoose.model("ShareLink", shareLinkSchema);

export default ShareLink;
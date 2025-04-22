import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import ShareLink from "@/lib/models/sharelink.model";
import Bill from "@/lib/models/bills.model";
import Contact from "@/lib/models/contact.model";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

interface BillItem {
    name: string;
    quantity: number;
    price: number;
    assignedContacts: string[];
}

export async function GET(
    request: Request,
    { params }: { params: { shareId: string } }
) {
    try {
        await connectToDB();
        const { userId } = await auth();
        const { shareId } = params;

        const shareLink = await ShareLink.findOne({ shareId });
        if (!shareLink) {
            return NextResponse.json({ error: "Share link not found" }, { status: 404 });
        }

        const bill = await Bill.findById(shareLink.billId);
        if (!bill) {
            return NextResponse.json({ error: "Bill not found" }, { status: 404 });
        }

        // Handle both Clerk user IDs and MongoDB ObjectIds
        let contact;
        if (shareLink.contactId.startsWith("user_")) {
            // If it's a Clerk user ID, find by clerkId
            contact = await Contact.findOne({ clerkId: shareLink.contactId });
        } else {
            // If it's a MongoDB ObjectId, find by _id
            contact = await Contact.findById(shareLink.contactId);
        }

        if (!contact) {
            // If no contact found, create a default one
            contact = {
                name: "Me",
                clerkId: shareLink.contactId
            };
        }

        // Calculate personal bill for this contact
        const personalBill = {
            storeName: bill.storeName,
            date: bill.date,
            imageUrl: bill.imageUrl,
            items: bill.items
                .filter((item: BillItem) => item.assignedContacts.includes(shareLink.contactId))
                .map((item: BillItem) => {
                    const numPeopleSharing = item.assignedContacts.length;
                    return {
                        name: item.name,
                        quantity: item.quantity / numPeopleSharing,
                        price: item.price / numPeopleSharing,
                        sharedWith: numPeopleSharing
                    };
                }),
        };

        const subtotal = personalBill.items.reduce((sum: number, item: { price: number }) => sum + item.price, 0);
        const proportion = subtotal / bill.subtotal;
        const taxShare = bill.totalTax * proportion;
        const tipShare = (bill.tipAmount || 0) * proportion;

        const isCurrentUser = 
            (shareLink.contactId.startsWith("user_") && shareLink.contactId === userId) || 
            (contact.clerkId && contact.clerkId === userId) || 
            contact.name === "Me";

        const isMyBill = (
            userId && (
              (shareLink.contactId === userId) ||
              (contact.clerkId && contact.clerkId === userId)
            )
        );

        return NextResponse.json({
            ...personalBill,
            subtotal,
            taxShare,
            tipShare,
            total: subtotal + taxShare + tipShare,
            contactName: contact.name || "Me",
            contactId: shareLink.contactId,
            isCurrentUser,
            isMyBill,
            paymentStatus: shareLink.paymentStatus || 'pending'
        });

    } catch (error) {
        console.error('Error getting shared bill:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
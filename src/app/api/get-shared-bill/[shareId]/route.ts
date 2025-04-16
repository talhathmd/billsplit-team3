import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import ShareLink from "@/lib/models/sharelink.model";
import Bill from "@/lib/models/bills.model";
import Contact from "@/lib/models/contact.model";
import { auth } from "@clerk/nextjs/server";

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
    const { userId } = auth(); // get the current user's ID from Clerk

    await connectToDB();
    
    // Access params.shareId directly in the query
    const shareLink = await ShareLink.findOne({ shareId: params.shareId });
    if (!shareLink) {
        return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }

    // Find the bill
    const bill = await Bill.findById(shareLink.billId);
    if (!bill) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Find the contact to get their name *!*!*!**!*!*!**!!**!*!*!*!**!*!*!*!*!*
    const contact = await Contact.findById(shareLink.contactId);
    if (!contact) {
        return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }


    // Find the items assigned to this contact
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

    // Calculate totals
    const subtotal = personalBill.items.reduce((sum: number, item: { price: number }) => sum + item.price, 0);
    const proportion = subtotal / bill.subtotal;
    const taxShare = bill.totalTax * proportion;

    const isCurrentUser = contact.clerkId === userId; // check if contact belongs to current user

    return NextResponse.json({
        ...personalBill,
        subtotal,
        taxShare,
        total: subtotal + taxShare,
        contactName: contact.name,
        contactId: contact._id.toString(),
        isCurrentUser: isCurrentUser,
        imageUrl: bill.imageUrl
    });
} 
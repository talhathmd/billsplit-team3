import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import ShareLink from "@/lib/models/sharelink.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        await connectToDB();
        const { userId } = await auth();

        const { billId } = await req.json();

        // Find all share links for this bill
        const shareLinks = await ShareLink.find({ billId });
        
        // Create a map of contactId to payment status
        const paymentStatuses = shareLinks.reduce((acc, link) => {
            acc[link.contactId] = link.paymentStatus;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ 
            success: true, 
            paymentStatuses 
        });
    } catch (error) {
        console.error("Error fetching payment statuses:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to fetch payment statuses" 
        }, { status: 500 });
    }
} 
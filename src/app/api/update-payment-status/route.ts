import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import ShareLink from "@/lib/models/sharelink.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        await connectToDB();
        const { userId } = await auth();

        const { shareId, status } = await req.json();

        const shareLink = await ShareLink.findOne({ shareId });
        if (!shareLink) {
            return NextResponse.json({ error: "Share link not found" }, { status: 404 });
        }

        // Update payment status
        shareLink.paymentStatus = status;
        await shareLink.save();

        return NextResponse.json({ 
            success: true, 
            paymentStatus: shareLink.paymentStatus 
        });
    } catch (error) {
        console.error("Error updating payment status:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to update payment status" 
        }, { status: 500 });
    }
} 
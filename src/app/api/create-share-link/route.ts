import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import ShareLink from "@/lib/models/sharelink.model"; // You'll need to create this model

export async function POST(req: Request) {
    try {
        await connectToDB();
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { billId, contactId } = await req.json();

        // Check if share link already exists
        const existingLink = await ShareLink.findOne({ billId, contactId });
        if (existingLink) {
            return NextResponse.json({ 
                success: true, 
                shareId: existingLink.shareId 
            });
        }

        // Create new share link if none exists
        const shareLink = await ShareLink.create({
            billId,
            contactId,
            shareId: crypto.randomUUID(),
            createdBy: clerkUser.id,
        });

        return NextResponse.json({ 
            success: true, 
            shareId: shareLink.shareId 
        });
    } catch (error) {
        console.error("Error creating share link:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Failed to create share link" 
        }, { status: 500 });
    }
} 
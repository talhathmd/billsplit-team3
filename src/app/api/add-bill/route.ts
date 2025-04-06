import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Bill from "@/lib/models/bills.model";
import Group from "@/lib/models/group.model";
import User from "@/lib/models/user.model";
import { currentUser } from "@clerk/nextjs/server"; 

export async function POST(req: Request) {
    try {
        await connectToDB();

        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mongoUser = await User.findOne({ clerkId: clerkUser.id });
        if (!mongoUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { imageUrl, totalAmount, groupId, status } = await req.json();

        if (!groupId || !totalAmount) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }
        
        // create a new bill
        const newBill = new Bill({
            clerkId: clerkUser.id, 
            imageUrl,
            totalAmount,
            participants: group.members, // contact Ids for members of group 
            status: status || "pending"
        });

        await newBill.save();

        return NextResponse.json({ success: true, message: "Bill created successfully!" });
    } catch (error) {
        console.error("Error creating bill: ", error);
        return NextResponse.json({ success: false, message: "Failed to create bill." }, { status: 500 });
    }
}
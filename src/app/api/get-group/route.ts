import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import { currentUser } from "@/clerk/nextjs/server";
import Group from "@/lib/models/group.model";
import User from "@/lib/models/user.model";

export async function GET() {
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

        const groups = await Group.find({ creator: mongoUser._id }).populate("members");

        return NextResponse.json({ success: true, groups });
    } catch (error) {
        console.error("Error fetching group", error);
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}
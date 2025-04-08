import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Bill from "@/lib/models/bills.model";

export async function GET() {
    try {
        await connectToDB();
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bills = await Bill.find({ clerkId: clerkUser.id });
        return NextResponse.json(bills);
    } catch (error) {
        console.error("Error fetching bills:", error);
        return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Bill from "@/lib/models/bills.model";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const bill = await Bill.create({
      ...body,
      clerkId: clerkUser.id
    });

    return NextResponse.json({ success: true, bill });
  } catch (error) {
    console.error("Error saving bill:", error);
    return NextResponse.json({ success: false, message: "Failed to save bill" }, { status: 500 });
  }
} 
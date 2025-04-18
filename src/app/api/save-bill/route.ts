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

    // Simplified duplicate check - only check essential fields
    const existingBill = await Bill.findOne({
      clerkId: clerkUser.id,
      storeName: body.storeName,
      date: body.date,
      time: body.time,
      total: body.total
    });

    if (existingBill) {
      return NextResponse.json({
        success: false,
        error: "This bill has already been saved."
      }, { status: 409 });
    }

    // Save the bill
    const bill = await Bill.create({
      ...body,
      clerkId: clerkUser.id
    });

    return NextResponse.json({ 
      success: true, 
      _id: bill._id
    });
  } catch (error) {
    console.error("Error saving bill:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save bill" 
    }, { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Bill from "@/lib/models/bills.model";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await req.json();
    await connectToDB();

    // Check for duplicate bill
    const existingBill = await Bill.findOne({
      clerkId: user.id,
      storeName: data.storeName,
      date: data.date,
      time: data.time,
      total: data.total,
    });

    if (existingBill) {
      return NextResponse.json(
        { error: "This bill appears to be a duplicate" },
        { status: 409 }
      );
    }

    // Create new bill with cash tip amount
    const bill = new Bill({
      clerkId: user.id,
      storeName: data.storeName,
      address: data.address,
      phoneNumber: data.phoneNumber,
      date: data.date,
      time: data.time,
      items: data.items,
      subtotal: data.subtotal,
      totalTax: data.totalTax,
      tipAmount: data.tipAmount || 0,  // Include tip amount
      total: data.total,
      imageUrl: data.imageUrl,
    });

    await bill.save();
    return NextResponse.json({ success: true, _id: bill._id });
  } catch (error) {
    console.error("Error saving bill:", error);
    return NextResponse.json(
      { error: "Failed to save bill" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import Bill, { BillItem } from "@/lib/models/bills.model";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check for existing bill with same content
    const existingBill = await Bill.findOne({
      clerkId: clerkUser.id,
      storeName: body.storeName,
      date: body.date,
      time: body.time,
      total: body.total,
      subtotal: body.subtotal,
      totalTax: body.totalTax,
      items: {
        $size: body.items.length,
        $all: body.items.map((item: BillItem) => ({
          $elemMatch: {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            assignedContacts: {
              $size: item.assignedContacts.length,
              $all: item.assignedContacts
            }
          }
        }))
      }
    });

    if (existingBill) {
      return NextResponse.json({
        success: false,
        error: "This exact bill has already been saved before."
      }, { status: 409 });
    }

    // If no duplicate found, save the new bill
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
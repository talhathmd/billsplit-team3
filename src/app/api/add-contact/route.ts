import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Contact from "@/lib/models/contact.model"; // Import the contact model
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk's currentUser function


export async function POST(req: Request) {
  try {
    await connectToDB();
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Check for existing contact with same email
    const existingContact = await Contact.findOne({
      clerkId: clerkUser.id,
      email: body.email
    });

    if (existingContact) {
      return NextResponse.json({
        success: false,
        error: "A contact with this email already exists"
      }, { status: 409 });
    }

    // If no duplicate found, create new contact
    const contact = await Contact.create({
      ...body,
      clerkId: clerkUser.id
    });

    return NextResponse.json({ 
      success: true, 
      contact 
    });
  } catch (error) {
    console.error("Error saving contact:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save contact" 
    }, { status: 500 });
  }
} 
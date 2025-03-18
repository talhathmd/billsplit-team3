import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Contact from "@/lib/models/contact.model"; // Import the contact model
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk's currentUser function


export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, email, phone } = await req.json();
    const clerkUser = await currentUser(); // Get the current user from Clerk

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a new contact
    const newContact = new Contact({
      clerkId: clerkUser.id, // Use the Clerk ID
      name,
      email,
      phone,
    });

    await newContact.save();

    return NextResponse.json({ success: true, message: "Contact added successfully!" });
  } catch (error) {
    console.error("Error adding contact:", error);
    return NextResponse.json({ success: false, message: "Failed to add contact." }, { status: 500 });
  }
} 
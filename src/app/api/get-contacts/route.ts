import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server"; // Import Clerk's currentUser function
import mongoose from "mongoose";
import Contact from "@/lib/models/contact.model"; // Import the contact model
import { connectToDB } from "@/lib/mongoose";



export async function GET(req: Request) {
  try {
    await connectToDB();
    const clerkUser = await currentUser(); // Get the current user from Clerk

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve contacts for the user
    const contacts = await Contact.find({ clerkId: clerkUser.id });

    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch contacts." }, { status: 500 });
  }
} 
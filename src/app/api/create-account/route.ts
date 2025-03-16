import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";

export async function GET() {
  try {
    // Ensure DB connection
    await connectToDB();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Clerk User Data:", clerkUser);

    // Check if user exists
    let user = await User.findOne({ clerkId: clerkUser.id });

    // If new user, create in MongoDB
    if (!user) {
      console.log("Creating new user in MongoDB");
      user = await User.create({
        clerkId: clerkUser.id,
        name: clerkUser.firstName,
        email: clerkUser.emailAddresses[0]?.emailAddress,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, phone, name } = body;

    // Log the incoming data for debugging
    console.log("Incoming data: ", { userId, email, phone, name });

    // Check if userId and email are provided
    if (!userId || !email) {
      console.error("User ID or email missing.");
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 });
    }

    await connectToDB();

    // Check if the user already exists based on email
    const existingUser = await User.findOne({ email });
    console.log("Existing user: ", existingUser);

    if (!existingUser) {
      // Create a new user if they don't exist
      const newUser = await User.create({
        clerkId: userId,
        name: name || userId,
        email,
        phone,
      });

      // Update the onboarding status
      await User.findByIdAndUpdate(newUser._id, { onboarded: true });

      return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });
    }

    console.log("User already exists.");
    return NextResponse.json({ message: "User already exists" }, { status: 200 });
  } catch (error) {
    console.error("Failed to create or update user:", error);
    return NextResponse.json({ error: "Failed to create or update user" }, { status: 500 });
  }
}
